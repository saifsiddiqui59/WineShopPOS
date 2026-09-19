import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { formatIndiaDate,parseIndiaDate,formatIndiaDateEntry } from "../src/lib/indiaDate.js";
import { purchaseLineReviewReasons } from "../src/lib/purchaseIdentity.js";
import { buildVisionReadSummary } from "../supabase/functions/_shared/invoiceSecondaryOcr.js";
import { requestAiMappings } from "../supabase/functions/_shared/invoiceResolutionFallback.js";

function polygon(x1,y1,x2,y2){
  return [{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2},{x:x1,y:y2}];
}

test("Indian date UI is DD/MM/YYYY while persisted value stays ISO",()=>{
  assert.equal(formatIndiaDate("2026-09-19"),"19/09/2026");
  assert.equal(parseIndiaDate("19/09/2026"),"2026-09-19");
  assert.equal(parseIndiaDate("19092026"),"2026-09-19");
  assert.equal(parseIndiaDate("31/02/2026"),"");
  assert.equal(formatIndiaDateEntry("19092026"),"19/09/2026");
});

test("Vision invoice date prefers DI InvoiceDate geometry over unrelated Date text",()=>{
  const primary={
    analyzeResult:{
      pages:[{pageNumber:1,width:1000,height:1000}],
      documents:[{fields:{
        InvoiceDate:{boundingRegions:[{pageNumber:1,polygon:polygon(700,100,900,150)}]}
      }}],
      tables:[]
    }
  };
  const vision={
    analyzeResult:{
      readResults:[{
        page:1,width:1000,height:1000,
        lines:[
          {text:"Date 19-04-2020",boundingBox:[50,500,250,500,250,530,50,530],words:[{confidence:.99}]},
          {text:"19-09-2026",boundingBox:[710,108,880,108,880,142,710,142],words:[{confidence:.93}]}
        ]
      }]
    }
  };
  const result=buildVisionReadSummary(vision,{items:[]},primary);
  assert.equal(result.chosen.invoiceDate.value,"2026-09-19");
});

test("direct cross-OCR disagreement may be advisory but is always forced to human review",async()=>{
  let called=false;
  const result=await requestAiMappings({
    config:{enabled:true,baseUrl:"https://unit.invalid",apiKey:"x",model:"gpt-5-mini",timeoutMs:3000},
    supplierName:"X",
    invoice:{items:[],crossOcr:{status:"REVIEW"}},
    issues:[{
      targetId:"header:invoice_date",
      fieldScope:"HEADER",
      canonicalField:"invoice_date",
      reason:"CROSS_OCR_DATE_CONFLICT",
      requiresHumanConfirmation:true
    }],
    evidence:[
      {id:"di-date",source:"key_value",label:"Invoice Date",rawValue:"19-07-2021",value:"2021-07-19",dateValue:"2021-07-19",itemIndexes:[]},
      {id:"vision-date",source:"vision_date_anchor",label:"DI InvoiceDate geometry",rawValue:"19-04-2020",value:"2020-04-19",dateValue:"2020-04-19",itemIndexes:[]}
    ],
    fetchImpl:async()=>{
      called=true;
      return{
        ok:true,
        status:200,
        json:async()=>({
          id:"resp_conflict_test",
          status:"completed",
          model:"gpt-5-mini",
          output:[{
            type:"message",
            content:[{
              type:"output_text",
              text:JSON.stringify({
                needs_review:false,
                mappings:[{target_id:"header:invoice_date",evidence_id:"vision-date"}]
              })
            }]
          }],
          usage:{input_tokens:100,output_tokens:20,output_tokens_details:{reasoning_tokens:0}}
        })
      };
    }
  });
  assert.equal(called,true);
  assert.equal(result.called,true);
  assert.equal(result.ok,true);
  assert.equal(result.mappings[0].requiresHumanConfirmation,true);
  assert.equal(result.needsReview,true);
});

test("intermediate finance semantics such as Assessable Value never reach AI mapping",async()=>{
  let called=false;
  const result=await requestAiMappings({
    config:{enabled:true,baseUrl:"https://unit.invalid",apiKey:"x",model:"gpt-5-mini",timeoutMs:3000},
    supplierName:"X",
    invoice:{items:[]},
    issues:[{targetId:"finance:other_addition",fieldScope:"FINANCE",canonicalField:"other_addition",reason:"FINANCE_REVIEW"}],
    evidence:[{id:"assessable",source:"key_value",label:"Assessable Value",rawValue:"68204",value:68204,moneyValue:68204,itemIndexes:[]}],
    fetchImpl:async()=>{called=true;throw new Error("should not call")}
  });
  assert.equal(called,false);
  assert.equal(result.called,false);
});

test("batch OCR conflict blocks purchase line until human confirmation",()=>{
  const row={
    productId:"p1",
    sourceDescription:"Haywards 2000 Strong Beer",
    invoiceSizeMl:650,
    caseCount:3,unitsPerCase:12,looseBottles:0,quantity:36,
    purchasePrice:147.75,mrp:160,
    scannedBarcode:"8902246000917",
    packResolution:{state:"VERIFIED_EVIDENCE"},
    batchNumber:"500 Aug-2026",
    batchReviewRequired:true,
    batchResolution:{state:"NEEDS_REVIEW"}
  };
  const product={id:"p1",name:"Haywards 2000 Strong Beer",brand:"Haywards",sizeMl:650,barcode:"8902246000917",mrp:160};
  assert.ok(purchaseLineReviewReasons(row,product).some(x=>x.includes("Batch / Lot")));
  row.batchReviewRequired=false;
  row.batchResolution={state:"HUMAN_CONFIRMED"};
  assert.equal(purchaseLineReviewReasons(row,product).some(x=>x.includes("Batch / Lot")),false);
});

test("server migration requires server readiness and atomic OCR wrapper",()=>{
  const sql=fs.readFileSync(new URL("../supabase/migrations/20260919223000_v6_ocr_receive_guard_v1.sql",import.meta.url),"utf8");
  assert.match(sql,/invoice_review_draft_ready_v2/);
  assert.match(sql,/v_status<>'READY_TO_RECEIVE'/);
  assert.match(sql,/batchReviewRequired/);
  assert.match(sql,/invoiceDateReviewRequired' is null/);
  assert.match(sql,/row->>'batchReviewRequired' is null/);
  assert.match(sql,/receive_ocr_purchase_v1/);
  assert.match(sql,/perform public\.invoice_link_purchase\(p_ingestion_id,v_purchase\)/);
});
