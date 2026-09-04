import fs from "node:fs";
const sql=fs.readFileSync("supabase/migrations/20260901113000_v3_05_fifo_and_product_cleanup.sql","utf8");
const checks=[
 ["allocation table",/inventory_fifo_allocations/],
 ["oldest lot first",/order by received_at asc,id asc/i],
 ["untracked first",/UNTRACKED_OPENING/],
 ["sale COGS snapshot",/fifo_line_cost/],
 ["offline sale",/OFFLINE_SALE/],
 ["trigger ordering",/trg_v1_fifo_record_stock_movement/],
 ["safe cleanup check",/admin_product_cleanup_check/],
 ["typed DELETE",/p_confirmation is distinct from 'DELETE'/]
];
let fail=0;for(const [n,r] of checks){const ok=r.test(sql);console.log(`${ok?"PASS":"FAIL"} ${n}`);if(!ok)fail++;}
function alloc(stock,lots,sell){let need=sell;const tracked=lots.reduce((n,l)=>n+l.q,0),out=[];let u=Math.max(stock-tracked,0);if(u&&need){let q=Math.min(u,need);out.push(["U",q]);need-=q;}for(const l of [...lots].sort((a,b)=>a.d.localeCompare(b.d))){if(!need)break;let q=Math.min(l.q,need);out.push([l.id,q]);need-=q;}return out;}
const got=JSON.stringify(alloc(25,[{id:"OLD",d:"2026-01-01",q:10},{id:"NEW",d:"2026-02-01",q:10}],12));
const exp=JSON.stringify([["U",5],["OLD",7]]);if(got!==exp){console.log("FAIL FIFO simulation",got);fail++;}else console.log("PASS FIFO simulation");
process.exitCode=fail?1:0;
