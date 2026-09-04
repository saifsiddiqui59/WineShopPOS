import SortableTable from "../components/ui/SortableTable";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import FeatureTierBadge from "../components/ui/FeatureTierBadge";
import EmptyState from "../components/ui/EmptyState";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});

export default function CustomerCredit(){
  const[balances,setBalances]=useState([]);
  const[promotions,setPromotions]=useState([]);
  const[vouchers,setVouchers]=useState([]);
  const[message,setMessage]=useState("");

  const[customer,setCustomer]=useState({name:"",mobile:"",email:""});
  const[entry,setEntry]=useState({customerId:"",type:"CHARGE",amount:"",reference:"",description:""});
  const[commercial,setCommercial]=useState({customerId:"",points:0,storeCredit:0,description:""});
  const[promo,setPromo]=useState({
    name:"",code:"",type:"PERCENT",value:"",minPurchase:0,maxDiscount:"",
    validFrom:new Date().toISOString().slice(0,10),validTo:"",autoApply:false
  });
  const[voucher,setVoucher]=useState({code:"",amount:"",customerId:"",expiresAt:"",notes:""});

  async function load(){
    const[b,p,v]=await Promise.all([
      supabase.rpc("customer_balances"),
      supabase.from("promotions").select("*").order("created_at",{ascending:false}).limit(100),
      supabase.from("gift_vouchers").select("id,code,customer_id,initial_balance,current_balance,expires_at,status,created_at").order("created_at",{ascending:false}).limit(100)
    ]);
    if(b.error||p.error||v.error)setMessage("Unable to load all customer-commercial data.");
    if(!b.error)setBalances(b.data||[]);
    if(!p.error)setPromotions(p.data||[]);
    if(!v.error)setVouchers(v.data||[]);
  }
  useEffect(()=>{load()},[]);

  async function addCustomer(e){
    e.preventDefault();
    const{data,error}=await supabase.rpc("create_customer",{p_full_name:customer.name,p_mobile:customer.mobile||null,p_email:customer.email||null,p_notes:null});
    if(error)setMessage("Unable to add customer. Mobile number may already exist.");
    else{
      setMessage("Customer created.");
      setCustomer({name:"",mobile:"",email:""});
      setEntry({...entry,customerId:data});
      load();
    }
  }

  async function postEntry(e){
    e.preventDefault();
    const{error}=await supabase.rpc("record_customer_credit",{
      p_customer_id:entry.customerId,
      p_entry_type:entry.type,
      p_amount:Number(entry.amount),
      p_sale_id:null,
      p_reference:entry.reference||null,
      p_description:entry.description||null
    });
    setMessage(error?"Unable to record customer credit entry.":"Customer credit ledger updated.");
    if(!error){setEntry({...entry,amount:"",reference:"",description:""});load()}
  }

  async function applyCommercial(e){
    e.preventDefault();
    if(!commercial.customerId){setMessage("Select a customer.");return}
    const jobs=[];
    if(Number(commercial.points||0)!==0){
      jobs.push(supabase.rpc("adjust_loyalty_points",{
        p_customer_id:commercial.customerId,
        p_points:Number(commercial.points),
        p_description:commercial.description||"Manager loyalty adjustment"
      }));
    }
    if(Number(commercial.storeCredit||0)>0){
      jobs.push(supabase.rpc("grant_store_credit",{
        p_customer_id:commercial.customerId,
        p_amount:Number(commercial.storeCredit),
        p_reference:"MANAGER_GRANT",
        p_description:commercial.description||"Manager store credit grant"
      }));
    }
    if(!jobs.length){setMessage("Enter points adjustment or store credit.");return}
    const results=await Promise.all(jobs);
    const error=results.find((r)=>r.error)?.error;
    setMessage(error?error.message:"Customer loyalty/store credit updated.");
    if(!error){setCommercial({...commercial,points:0,storeCredit:0,description:""});load()}
  }

  async function createPromo(e){
    e.preventDefault();
    const{error}=await supabase.rpc("create_promotion",{
      p_name:promo.name,
      p_code:promo.code||null,
      p_discount_type:promo.type,
      p_discount_value:Number(promo.value),
      p_min_purchase:Number(promo.minPurchase||0),
      p_max_discount:promo.maxDiscount===""?null:Number(promo.maxDiscount),
      p_valid_from:promo.validFrom,
      p_valid_to:promo.validTo||null,
      p_total_usage_limit:null,
      p_per_customer_limit:null,
      p_auto_apply:Boolean(promo.autoApply)
    });
    setMessage(error?error.message:"Promotion created.");
    if(!error){
      setPromo({...promo,name:"",code:"",value:"",maxDiscount:"",validTo:"",autoApply:false});
      load();
    }
  }

  async function issueVoucher(e){
    e.preventDefault();
    const{error}=await supabase.rpc("issue_gift_voucher",{
      p_code:voucher.code,
      p_amount:Number(voucher.amount),
      p_customer_id:voucher.customerId||null,
      p_expires_at:voucher.expiresAt||null,
      p_notes:voucher.notes||null
    });
    setMessage(error?error.message:"Gift voucher issued.");
    if(!error){setVoucher({code:"",amount:"",customerId:"",expiresAt:"",notes:""});load()}
  }

  const customerRows=useMemo(()=>balances.map((c)=>({...c})),[balances]);

  return <div>
    <PageHeader title="Customer, Credit & Rewards" tier="PLUS" subtitle="Customer records, Udhaar, loyalty, promotions, store credit and gift vouchers."/>
    {message?<div className="purchase-message">{message}</div>:null}

    <div className="settings-grid">
      <form className="panel" onSubmit={addCustomer}>
        <h3>New Customer <FeatureTierBadge tier="PLUS"/></h3>
        <div className="settings-fields">
          <label>Name<input required value={customer.name} onChange={(e)=>setCustomer({...customer,name:e.target.value})}/></label>
          <label>Mobile<input value={customer.mobile} onChange={(e)=>setCustomer({...customer,mobile:e.target.value})}/></label>
          <label>Email<input type="email" value={customer.email} onChange={(e)=>setCustomer({...customer,email:e.target.value})}/></label>
        </div><br/><button className="primary-button">Add Customer</button>
      </form>

      <form className="panel" onSubmit={postEntry}>
        <h3>Udhaar / Payment Entry</h3>
        <div className="settings-fields">
          <label>Customer<select required value={entry.customerId} onChange={(e)=>setEntry({...entry,customerId:e.target.value})}><option value="">Select customer</option>{balances.map((c)=><option key={c.customer_id} value={c.customer_id}>{c.full_name} · {money.format(c.outstanding)}</option>)}</select></label>
          <label>Entry Type<select value={entry.type} onChange={(e)=>setEntry({...entry,type:e.target.value})}><option value="CHARGE">Udhaar / Charge</option><option value="PAYMENT">Payment Received</option><option value="ADJUSTMENT_DEBIT">Debit Adjustment</option><option value="ADJUSTMENT_CREDIT">Credit Adjustment</option></select></label>
          <label>Amount<input type="number" min="0.01" step="0.01" required value={entry.amount} onChange={(e)=>setEntry({...entry,amount:e.target.value})}/></label>
          <label>Reference<input value={entry.reference} onChange={(e)=>setEntry({...entry,reference:e.target.value})}/></label>
          <label>Description<input value={entry.description} onChange={(e)=>setEntry({...entry,description:e.target.value})}/></label>
        </div><br/><button className="primary-button">Record Entry</button>
      </form>

      <form className="panel" onSubmit={applyCommercial}>
        <h3>Loyalty / Store Credit</h3>
        <div className="settings-fields">
          <label>Customer<select required value={commercial.customerId} onChange={(e)=>setCommercial({...commercial,customerId:e.target.value})}><option value="">Select customer</option>{customerRows.map((c)=><option key={c.customer_id} value={c.customer_id}>{c.full_name}</option>)}</select></label>
          <label>Points Adjustment (+/-)<input type="number" value={commercial.points} onChange={(e)=>setCommercial({...commercial,points:e.target.value})}/></label>
          <label>Grant Store Credit<input type="number" min="0" step="0.01" value={commercial.storeCredit} onChange={(e)=>setCommercial({...commercial,storeCredit:e.target.value})}/></label>
          <label>Reason / Description<input value={commercial.description} onChange={(e)=>setCommercial({...commercial,description:e.target.value})}/></label>
        </div><br/><button className="primary-button">Apply Customer Benefit</button>
      </form>

      <form className="panel" onSubmit={createPromo}>
        <h3>Create Coupon / Promotion</h3>
        <div className="settings-fields">
          <label>Name<input required value={promo.name} onChange={(e)=>setPromo({...promo,name:e.target.value})}/></label>
          <label>Coupon Code (blank = no code)<input value={promo.code} onChange={(e)=>setPromo({...promo,code:e.target.value.toUpperCase()})}/></label>
          <label>Type<select value={promo.type} onChange={(e)=>setPromo({...promo,type:e.target.value})}><option value="PERCENT">Percent</option><option value="FIXED">Fixed ₹</option></select></label>
          <label>Value<input type="number" min="0.01" step="0.01" required value={promo.value} onChange={(e)=>setPromo({...promo,value:e.target.value})}/></label>
          <label>Minimum Purchase<input type="number" min="0" step="0.01" value={promo.minPurchase} onChange={(e)=>setPromo({...promo,minPurchase:e.target.value})}/></label>
          <label>Max Discount<input type="number" min="0" step="0.01" value={promo.maxDiscount} onChange={(e)=>setPromo({...promo,maxDiscount:e.target.value})}/></label>
          <label>Valid From<input type="date" value={promo.validFrom} onChange={(e)=>setPromo({...promo,validFrom:e.target.value})}/></label>
          <label>Valid To<input type="date" value={promo.validTo} onChange={(e)=>setPromo({...promo,validTo:e.target.value})}/></label>
          <label><input type="checkbox" checked={promo.autoApply} onChange={(e)=>setPromo({...promo,autoApply:e.target.checked})}/> Auto-apply when eligible</label>
        </div><br/><button className="primary-button">Create Promotion</button>
      </form>

      <form className="panel" onSubmit={issueVoucher}>
        <h3>Issue Gift Voucher</h3>
        <div className="settings-fields">
          <label>Voucher Code<input required value={voucher.code} onChange={(e)=>setVoucher({...voucher,code:e.target.value.toUpperCase()})}/></label>
          <label>Amount<input type="number" min="0.01" step="0.01" required value={voucher.amount} onChange={(e)=>setVoucher({...voucher,amount:e.target.value})}/></label>
          <label>Customer (optional)<select value={voucher.customerId} onChange={(e)=>setVoucher({...voucher,customerId:e.target.value})}><option value="">Bearer voucher</option>{customerRows.map((c)=><option key={c.customer_id} value={c.customer_id}>{c.full_name}</option>)}</select></label>
          <label>Expiry<input type="date" value={voucher.expiresAt} onChange={(e)=>setVoucher({...voucher,expiresAt:e.target.value})}/></label>
          <label>Notes<input value={voucher.notes} onChange={(e)=>setVoucher({...voucher,notes:e.target.value})}/></label>
        </div><br/><button className="primary-button">Issue Voucher</button>
      </form>
    </div>

    <section className="panel" style={{marginTop:16}}>
      <h3>Customer Outstanding</h3>
      {balances.length===0?<EmptyState title="No customer credit records" message="Customer capture remains optional during normal billing."/>:<div className="data-table-wrapper"><SortableTable className="data-table"><thead><tr><th>Customer</th><th>Mobile</th><th>Charges</th><th>Payments</th><th>Outstanding</th></tr></thead><tbody>{balances.map((c)=><tr key={c.customer_id}><td>{c.full_name}</td><td>{c.mobile||"-"}</td><td>{money.format(c.total_charges)}</td><td>{money.format(c.total_payments)}</td><td><strong>{money.format(c.outstanding)}</strong></td></tr>)}</tbody></SortableTable></div>}
    </section>

    <section className="panel" style={{marginTop:16}}>
      <h3>Active / Recent Promotions</h3>
      <div className="data-table-wrapper"><SortableTable className="data-table"><thead><tr><th>Name</th><th>Code</th><th>Benefit</th><th>Minimum</th><th>Auto</th><th>Status</th></tr></thead><tbody>{promotions.map((p)=><tr key={p.id}><td>{p.name}</td><td>{p.code||"-"}</td><td>{p.discount_type==="PERCENT"?`${p.discount_value}%`:money.format(p.discount_value)}</td><td>{money.format(p.min_purchase)}</td><td>{p.auto_apply?"Yes":"No"}</td><td>{p.active?"Active":"Inactive"}</td></tr>)}</tbody></SortableTable></div>
    </section>

    <section className="panel" style={{marginTop:16}}>
      <h3>Gift Vouchers</h3>
      <div className="data-table-wrapper"><SortableTable className="data-table"><thead><tr><th>Code</th><th>Initial</th><th>Balance</th><th>Expiry</th><th>Status</th></tr></thead><tbody>{vouchers.map((v)=><tr key={v.id}><td>{v.code}</td><td>{money.format(v.initial_balance)}</td><td>{money.format(v.current_balance)}</td><td>{v.expires_at||"-"}</td><td>{v.status}</td></tr>)}</tbody></SortableTable></div>
    </section>
  </div>
}
