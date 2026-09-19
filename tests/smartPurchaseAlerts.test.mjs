import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=(path)=>fs.readFileSync(path,"utf8");

test("Smart Purchase Alerts are optional, owner-only and global",()=>{
  const settings=read("src/pages/Settings.jsx");
  const layout=read("src/components/Layout.jsx");
  const center=read("src/components/PurchaseAlertCenter.jsx");
  for(const marker of ["Smart Purchase Alerts:","purchase_alert_policy_v1","set_smart_purchase_alerts_v1","4-day supplier delivery time","2-day safety window"])
    assert.ok(settings.includes(marker),`Settings missing ${marker}`);
  assert.ok(layout.includes("PurchaseAlertCenter"));
  assert.ok(center.includes('profile?.role === "ADMIN"'));
  assert.ok(center.includes("purchase_alert_snapshot_v1"));
  assert.ok(center.includes("snooze_all_purchase_alerts_v1"));
  assert.ok(center.includes("dismiss_all_purchase_alerts_v1"));
  assert.ok(center.includes("60 * 60 * 1000"));
  assert.ok(center.includes('/purchasing/intelligence'));
});

test("alert layer never creates a PO directly",()=>{
  const center=read("src/components/PurchaseAlertCenter.jsx");
  assert.ok(!center.includes("create_purchase_order"));
  assert.ok(center.includes("Review Purchase Plan"));
});

test("backend reconciles POs and throttles reminders",()=>{
  const sql=read("supabase/migrations/20260919200033_smart_purchase_alerts_v1.sql");
  for(const marker of ["purchase_alert_states","purchase_coach_v2(30)","REVIEW_EXISTING_PO","CHECK_ETA","EXPEDITE_INBOUND","REVIEW_PURCHASE","interval '1 hour'","p_days not in (1,2)","pg_advisory_xact_lock","delivery_lead_days',4","safety_stock_days',2"])
    assert.ok(sql.includes(marker),`migration missing ${marker}`);
});
