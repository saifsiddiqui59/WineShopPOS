function finiteMoney(value){
  if(value==null||value==="")return null;
  const number=Number(value);
  return Number.isFinite(number)&&number>=0?number:null;
}

export function resolveInvoiceDisplayTotal(row,postedPurchase=null){
  // Compatibility-first: keep existing Inbox totals exactly as they are today.
  const extracted=finiteMoney(row?.extracted_total);
  if(extracted!=null){
    return{value:extracted,source:"OCR_EXTRACTED_TOTAL"};
  }

  // Only fill the dash when OCR did not confidently resolve a total.
  const reviewed=finiteMoney(
    row?.review_draft?.purchaseDraft?.financialSummary?.total
  );
  if(reviewed!=null){
    return{value:reviewed,source:"REVIEWED_TOTAL_FALLBACK"};
  }

  // Completed purchase data is the last fallback; never override valid OCR.
  if(row?.purchase_id){
    const postedLanded=finiteMoney(postedPurchase?.total_landed_cost);
    if(postedLanded!=null){
      return{value:postedLanded,source:"POSTED_PURCHASE_LANDED_FALLBACK"};
    }

    const postedProduct=finiteMoney(postedPurchase?.total);
    if(postedProduct!=null){
      return{value:postedProduct,source:"POSTED_PURCHASE_PRODUCT_FALLBACK"};
    }
  }

  return{value:null,source:"UNAVAILABLE"};
}
