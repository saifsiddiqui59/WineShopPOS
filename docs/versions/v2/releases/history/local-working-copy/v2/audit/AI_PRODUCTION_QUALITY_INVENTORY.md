# WineShopPOS V2 — AI Production Quality Inventory

## AI integration evidence
```text
src/pages/Approvals.jsx:9:async function act(item,action){setBusy(`${item.type}-${item.id}`);let fn,args;if(item.type==="RETURN"){fn=action==="approve"?"approve_return_request":"reject_return_request";args=action==="approve"?{p_request_id:item.id}:{p_request_id:item.id,p_note:"Rejected from Approval Center"}}else if(item.type==="SHIFT"){fn="approve_shift_close";args={p_shift_id:item.id,p_notes:"Approved from Approval Center"}}else if(item.type==="STOCK_COUNT"){fn="approve_stock_count";args={p_stock_count_id:item.id}}else if(item.type==="TRANSFER"){fn=action==="approve"?"approve_stock_transfer":"reject_stock_transfer";args=action==="approve"?{p_transfer_id:item.id}:{p_transfer_id:item.id,p_note:"Rejected from Approval Center"}}else{fn=action==="approve"?"approve_purchase_order":"set_purchase_order_status";args=action==="approve"?{p_po_id:item.id}:{p_po_id:item.id,p_status:"CANCELLED"}}const{error}=await supabase.rpc(fn,args);setMessage(error?"Approval action could not be completed. Refresh and verify its current status.":`${item.type.replaceAll("_"," ")} ${action}d.`);if(!error)await load();setBusy("")}
src/pages/OwnerAI.jsx:114:        requestId: result.request_id,
src/pages/Returns.jsx:19:  async function review(id,action){const fn=action==="approve"?"approve_return_request":"reject_return_request";const args=action==="approve"?{p_request_id:id}:{p_request_id:id,p_note:"Rejected by manager"};const{error}=await supabase.rpc(fn,args);setMessage(error?error.message:`Return ${action}d.`);if(!error){await Promise.all([load(),refreshAll()])}}
supabase/migrations/20260829190000_chapters_16_26.sql:69:alter table public.payments add column if not exists return_request_id uuid;
supabase/migrations/20260829190000_chapters_16_26.sql:118:  return_request_id uuid not null references public.sale_return_requests(id) on delete cascade,
supabase/migrations/20260829190000_chapters_16_26.sql:128:create index if not exists idx_return_items_request on public.sale_return_items(return_request_id);
supabase/migrations/20260829190000_chapters_16_26.sql:557:    join public.sale_return_requests rr on rr.id=sri.return_request_id
supabase/migrations/20260829190000_chapters_16_26.sql:562:    insert into public.sale_return_items(shop_id,return_request_id,sale_item_id,product_id,quantity,unit_refund,line_refund)
supabase/migrations/20260829190000_chapters_16_26.sql:574:create or replace function public.approve_return_request(p_request_id uuid)
supabase/migrations/20260829190000_chapters_16_26.sql:592:  select * into v_req from public.sale_return_requests where id=p_request_id and shop_id=v_shop for update;
supabase/migrations/20260829190000_chapters_16_26.sql:596:  for r in select * from public.sale_return_items where return_request_id=p_request_id
supabase/migrations/20260829190000_chapters_16_26.sql:603:    values(v_shop,r.product_id,'CUSTOMER_RETURN',r.quantity,v_before,v_after,'SALE_RETURN',p_request_id,'Approved customer return',auth.uid());
supabase/migrations/20260829190000_chapters_16_26.sql:607:  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,return_request_id,shift_id)
supabase/migrations/20260829190000_chapters_16_26.sql:608:  values(v_shop,v_req.sale_id,v_req.refund_method,v_req.total_refund,v_req.refund_reference,'REFUND',p_request_id,v_shift);
supabase/migrations/20260829190000_chapters_16_26.sql:610:  update public.sale_return_requests set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_request_id;
supabase/migrations/20260829190000_chapters_16_26.sql:614:  from public.sale_return_items sri join public.sale_return_requests rr on rr.id=sri.return_request_id
supabase/migrations/20260829190000_chapters_16_26.sql:621:  perform public.write_audit(v_shop,'RETURN_APPROVED','sale_return_request',p_request_id::text,null,to_jsonb(v_req),jsonb_build_object('refund',v_req.total_refund));
supabase/migrations/20260829190000_chapters_16_26.sql:625:create or replace function public.reject_return_request(p_request_id uuid, p_note text default null)
supabase/migrations/20260829190000_chapters_16_26.sql:636:  where id=p_request_id and shop_id=v_shop and status='PENDING';
supabase/migrations/20260829190000_chapters_16_26.sql:638:  perform public.write_audit(v_shop,'RETURN_REJECTED','sale_return_request',p_request_id::text,null,null,jsonb_build_object('note',p_note));
supabase/migrations/20260829190000_chapters_16_26.sql:1394:  shop_id=public.current_shop_id() and exists(select 1 from public.sale_return_requests r where r.id=return_request_id)
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:54:  request_id uuid not null unique,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:234:  p_request_id uuid,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:262:    organization_id,shop_id,user_id,request_id,question_category,tools_called,status,latency_ms
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:265:    v_org,v_log_shop,auth.uid(),p_request_id,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:270:  on conflict(request_id) do update set
./.env.local:3:VITE_AI_API_URL=https://wineshoppos-ai-1a61d5885c.azurewebsites.net
./.git/logs/HEAD:24:60a765fda847af47dae2aa4be80386570dcf420f 09d481daf700575eac71d7d69ef6fc286c5af72b saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com> 1788084816 -0400	commit: fix: sync verified Foundry runtime authentication
./.git/logs/refs/heads/main:23:60a765fda847af47dae2aa4be80386570dcf420f 09d481daf700575eac71d7d69ef6fc286c5af72b saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com> 1788084816 -0400	commit: fix: sync verified Foundry runtime authentication
./ai-india-resume-20260830T075127Z.log:32:INDIA-ONLY FOUNDRY MODEL DISCOVERY
./ai-india-resume-20260830T075127Z.log:34:Selected Foundry region : southindia
./ai-india-resume-20260830T075127Z.log:35:Selected model          : gpt-5-mini
./ai-india-resume-20260830T075127Z.log:39:CREATE / REUSE FOUNDRY RESOURCE
./ai-india-resume-20260830T075127Z.log:43:CREATE / REUSE FOUNDRY PROJECT
./ai-india-resume-20260830T075127Z.log:47:FOUNDRY MODEL DEPLOYMENT
./ai-india-resume-20260830T075127Z.log:49:A usage-billed Foundry model deployment is required.
./ai-india-resume-20260830T075127Z.log:51:Model: gpt-5-mini
./ai-india-resume-20260830T075503Z.log:26:INDIA-ONLY FOUNDRY MODEL DISCOVERY
./ai-india-resume-20260830T075503Z.log:28:Selected Foundry region : southindia
./ai-india-resume-20260830T075503Z.log:29:Selected model          : gpt-5-mini
./ai-india-resume-20260830T075503Z.log:33:CREATE / REUSE FOUNDRY RESOURCE
./ai-india-resume-20260830T075503Z.log:37:CREATE / REUSE FOUNDRY PROJECT
./ai-india-resume-20260830T075503Z.log:41:FOUNDRY MODEL DEPLOYMENT
./ai-india-resume-20260830T075503Z.log:43:A usage-billed Foundry model deployment is required.
./ai-india-resume-20260830T075503Z.log:45:Model: gpt-5-mini
./ai-india-resume-20260830T075503Z.log:50:FOUNDRY RBAC FOR AGENT CONFIGURATION
./ai-india-resume-20260830T075503Z.log:57:WARNING: Your Linux function app 'wineshoppos-ai-1a61d5885c', that uses a consumption plan has been successfully created but is not active until content is published using Azure Portal or the Functions Core Tools.
./ai-india-resume-20260830T075503Z.log:58:WARNING: Application Insights "wineshoppos-ai-1a61d5885c" was created for this Function App. You can visit https://portal.azure.com/#resource/subscriptions/3a5e8018-40a4-49e3-bcba-a9af3344f50e/resourceGroups/wineshopPOS/providers/microsoft.insights/components/wineshoppos-ai-1a61d5885c/overview to view your Application Insights component
./ai-india-resume-20260830T082140Z.log:27:Legacy Foundry account detected: wineshoppos-ai-1a61d5885c (eastus)
./ai-india-resume-20260830T082140Z.log:31:INDIA-ONLY FOUNDRY MODEL DISCOVERY
./ai-india-resume-20260830T082140Z.log:33:Selected Foundry region : southindia
./ai-india-resume-20260830T082140Z.log:34:Selected model          : gpt-5-mini
./ai-india-resume-20260830T082140Z.log:38:CREATE / REUSE FOUNDRY RESOURCE
./ai-india-resume-20260830T082140Z.log:42:CREATE / REUSE FOUNDRY PROJECT
./ai-india-resume-20260830T082140Z.log:46:FOUNDRY MODEL DEPLOYMENT
./ai-india-resume-20260830T082140Z.log:48:Reusing deployment: gpt-5-mini
./ai-india-resume-20260830T082140Z.log:51:FOUNDRY RBAC FOR AGENT CONFIGURATION
./ai-india-resume-20260830T082140Z.log:69:> wineshoppos-ai-owner-assistant@1.0.0 check
./ai-india-resume-20260830T082140Z.log:73:> wineshoppos-ai-owner-assistant@1.0.0 test
./ai-india-resume-20260830T082140Z.log:91:  "agent_name": "WineShopPOS-Owner-Agent",
./ai-india-resume-20260830T082140Z.log:93:  "model_deployment": "gpt-5-mini"
./ai-india-resume-20260830T082140Z.log:1310:AI Function: https://wineshoppos-ai-1a61d5885c.azurewebsites.net
./ai-india-resume-20260830T082140Z.log:1311:Foundry: southindia / gpt-5-mini
./ai-india-resume-20260830T082140Z.log:1315:Legacy East US Foundry is preserved for cleanup only after India verification.
./ai-owner-v1-20260830T073304Z.log:1197:AI-03/04/05 — AZURE FUNCTION TRUST BOUNDARY + ONE FOUNDRY AGENT
./ai-owner-v1-20260830T073304Z.log:1215:> wineshoppos-ai-owner-assistant@1.0.0 check
./ai-owner-v1-20260830T073304Z.log:1219:> wineshoppos-ai-owner-assistant@1.0.0 test
./ai-owner-v1-20260830T073304Z.log:2466:MICROSOFT FOUNDRY + AZURE FUNCTION PROVISIONING
./ai-owner-v1-20260830T073304Z.log:2468:Finding supported Foundry region for gpt-5-mini...
./ai-owner-v1-20260830T073304Z.log:2469:Creating dedicated Foundry resource wineshoppos-ai-1a61d5885c in eastus
./azure-functions/ai-owner-assistant/host.json:4:    "applicationInsights": {
./azure-functions/ai-owner-assistant/package-lock.json:2:  "name": "wineshoppos-ai-owner-assistant",
./azure-functions/ai-owner-assistant/package-lock.json:8:      "name": "wineshoppos-ai-owner-assistant",
./azure-functions/ai-owner-assistant/package.json:2:  "name": "wineshoppos-ai-owner-assistant",
./azure-functions/ai-owner-assistant/scripts/configure-agent.mjs:5:const endpoint = process.env.FOUNDRY_PROJECT_ENDPOINT;
./azure-functions/ai-owner-assistant/scripts/configure-agent.mjs:6:const agentName = process.env.FOUNDRY_AGENT_NAME || "WineShopPOS-Owner-Agent";
./azure-functions/ai-owner-assistant/scripts/configure-agent.mjs:7:const modelDeployment = process.env.FOUNDRY_MODEL_DEPLOYMENT;
./azure-functions/ai-owner-assistant/scripts/configure-agent.mjs:10:  throw new Error("FOUNDRY_PROJECT_ENDPOINT and FOUNDRY_MODEL_DEPLOYMENT are required.");
./azure-functions/ai-owner-assistant/src/index.js:15:const FOUNDRY_PROJECT_ENDPOINT = process.env.FOUNDRY_PROJECT_ENDPOINT;
./azure-functions/ai-owner-assistant/src/index.js:16:const FOUNDRY_AGENT_NAME = process.env.FOUNDRY_AGENT_NAME || "WineShopPOS-Owner-Agent";
./azure-functions/ai-owner-assistant/src/index.js:24:function createFoundryCredential() {
./azure-functions/ai-owner-assistant/src/index.js:163:      { body: { agent_reference: { name: FOUNDRY_AGENT_NAME, type: "agent_reference" } } },
./azure-functions/ai-owner-assistant/src/index.js:170:      /agent|agent_reference|reference|request body|unknown field|invalid/i.test(msg);
./azure-functions/ai-owner-assistant/src/index.js:174:      { body: { agent_reference: { name: FOUNDRY_AGENT_NAME, type: "agent_reference" } } },
./azure-functions/ai-owner-assistant/src/index.js:179:async function runFoundry(caller, trustedContext, body) {
./azure-functions/ai-owner-assistant/src/index.js:180:  if (!FOUNDRY_PROJECT_ENDPOINT) throw new Error("Foundry project endpoint is not configured.");
./azure-functions/ai-owner-assistant/src/index.js:182:  const project = new AIProjectClient(FOUNDRY_PROJECT_ENDPOINT, createFoundryCredential());
./azure-functions/ai-owner-assistant/src/index.js:187:  let foundryStage = "CREATE_CONVERSATION";
./azure-functions/ai-owner-assistant/src/index.js:191:    foundryStage = "FIRST_RESPONSE";
./azure-functions/ai-owner-assistant/src/index.js:217:        foundryStage = `TOOL:${call.name}`;
./azure-functions/ai-owner-assistant/src/index.js:234:      foundryStage = "FOLLOWUP_RESPONSE";
./azure-functions/ai-owner-assistant/src/index.js:244:    if (!answer) throw new Error("Foundry returned no answer.");
./azure-functions/ai-owner-assistant/src/index.js:276:    foundryConfigured: Boolean(FOUNDRY_PROJECT_ENDPOINT && FOUNDRY_AGENT_NAME),
./azure-functions/ai-owner-assistant/src/index.js:293:      if (!token) return json(401, { request_id: requestId, error: "Sign in again to use Owner AI." });
./azure-functions/ai-owner-assistant/src/index.js:297:      catch { return json(400, { request_id: requestId, error: "Invalid request body." }); }
./azure-functions/ai-owner-assistant/src/index.js:305:        return json(401, { request_id: requestId, error: "Your session is not valid. Sign in again." });
./azure-functions/ai-owner-assistant/src/index.js:322:          p_request_id: requestId,
./azure-functions/ai-owner-assistant/src/index.js:330:        return json(429, { request_id: requestId, error: "AI request limit reached. Try again later." });
./azure-functions/ai-owner-assistant/src/index.js:334:        p_request_id: requestId,
./azure-functions/ai-owner-assistant/src/index.js:343:      const result = await withTimeout(runFoundry(caller, trustedContext, body), REQUEST_TIMEOUT_MS);
./azure-functions/ai-owner-assistant/src/index.js:347:        p_request_id: requestId,
./azure-functions/ai-owner-assistant/src/index.js:358:        request_id: requestId,
./azure-functions/ai-owner-assistant/src/index.js:379:          p_request_id: requestId,
./azure-functions/ai-owner-assistant/src/index.js:392:        request_id: requestId,
./docs/ai/AI_OBSERVABILITY_EVALUATION_PLAN.md:1:# AI Observability & Evaluation Plan
./docs/ai/AI_OBSERVABILITY_EVALUATION_PLAN.md:7:Full Foundry trace integration, continuous AI quality evaluation and release gates are **not yet declared complete**.
./docs/ai/AI_OBSERVABILITY_EVALUATION_PLAN.md:21:- request/trace correlation ID
./docs/ai/AI_OBSERVABILITY_EVALUATION_PLAN.md:36:- Groundedness
./docs/ai/AI_OBSERVABILITY_EVALUATION_PLAN.md:48:- Groundedness ≥ 4.0 / 5
./docs/ai/AI_OBSERVABILITY_EVALUATION_PLAN.md:56:## Evaluation cadence
./docs/ai/AI_OBSERVABILITY_EVALUATION_PLAN.md:60:- failed/fallback AI requests: 100% review/evaluation
./docs/ai/AI_OWNER_ASSISTANT_V1.md:39:Microsoft Foundry
./docs/ai/AI_OWNER_ASSISTANT_V1.md:40:  ↓ WineShopPOS-Owner-Agent
./docs/ai/AI_OWNER_ASSISTANT_V1.md:51:- Foundry: South India
./docs/ai/AI_OWNER_ASSISTANT_V1.md:52:- Model: `gpt-5-mini`
./docs/ai/AI_OWNER_ASSISTANT_V1.md:53:- Agent: `WineShopPOS-Owner-Agent`
./docs/ai/AI_OWNER_ASSISTANT_V1.md:54:- Foundry request shape: `agent_reference`
./docs/ai/AI_OWNER_ASSISTANT_V1.md:56:- Foundry RBAC for current project-level runtime: Foundry User at project scope
./docs/ai/AI_OWNER_ASSISTANT_V1.md:78:The complete production flow is working, including authentication, authorization, Foundry function calling, Supabase tool execution and the final response.
./docs/ai/AZURE_SUPABASE_CONFIGURATION.md:27:- Name: `wineshoppos-ai-1a61d5885c`
./docs/ai/AZURE_SUPABASE_CONFIGURATION.md:34:### Microsoft Foundry
./docs/ai/AZURE_SUPABASE_CONFIGURATION.md:36:- Production account: `wineshoppos-ai-in-1a61d5885c`
./docs/ai/AZURE_SUPABASE_CONFIGURATION.md:38:- Project: `wineshoppos-ai`
./docs/ai/AZURE_SUPABASE_CONFIGURATION.md:39:- Model: `gpt-5-mini`
./docs/ai/AZURE_SUPABASE_CONFIGURATION.md:42:- Agent: `WineShopPOS-Owner-Agent`
./docs/ai/AZURE_SUPABASE_CONFIGURATION.md:43:- Function runtime RBAC: Foundry User at project scope
./docs/ai/AZURE_SUPABASE_CONFIGURATION.md:45:The old East US Foundry resource is legacy cleanup only.
./docs/ai/AZURE_SUPABASE_CONFIGURATION.md:71:Foundry tool request
./docs/ai/CURRENT_AI_INFRASTRUCTURE_STATUS.md:8:- South India Foundry production resource
./docs/ai/CURRENT_AI_INFRASTRUCTURE_STATUS.md:9:- Foundry project
./docs/ai/CURRENT_AI_INFRASTRUCTURE_STATUS.md:10:- `gpt-5-mini` deployment
./docs/ai/CURRENT_AI_INFRASTRUCTURE_STATUS.md:11:- `WineShopPOS-Owner-Agent`
./docs/ai/CURRENT_AI_INFRASTRUCTURE_STATUS.md:14:- Foundry project RBAC corrected
./docs/ai/CURRENT_AI_INFRASTRUCTURE_STATUS.md:15:- current `agent_reference` runtime
./docs/ai/CURRENT_AI_INFRASTRUCTURE_STATUS.md:22:1. Azure CLI/Foundry partial provisioning left a legacy East US resource.
./docs/ai/CURRENT_AI_INFRASTRUCTURE_STATUS.md:24:3. Foundry deprecated `body.agent`; current runtime requires `agent_reference`.
./docs/ai/CURRENT_AI_INFRASTRUCTURE_STATUS.md:26:5. Function managed identity now uses the verified project-scope Foundry User permission.
./docs/ai/CURRENT_AI_INFRASTRUCTURE_STATUS.md:30:- connect/verify full Foundry tracing into Application Insights
./docs/ai/CURRENT_AI_INFRASTRUCTURE_STATUS.md:31:- production evaluation dashboard
./docs/ai/CURRENT_AI_INFRASTRUCTURE_STATUS.md:34:- legacy East US Foundry cleanup
./docs/ai/DEPLOYMENT_METADATA.md:8:- Foundry region: `southindia`
./docs/ai/DEPLOYMENT_METADATA.md:9:- Foundry resource: `wineshoppos-ai-in-1a61d5885c`
./docs/ai/DEPLOYMENT_METADATA.md:10:- Foundry project: `wineshoppos-ai`
./docs/ai/DEPLOYMENT_METADATA.md:11:- Model: `gpt-5-mini`
./docs/ai/DEPLOYMENT_METADATA.md:12:- Model deployment: `gpt-5-mini`
./docs/ai/DEPLOYMENT_METADATA.md:13:- Owner agent: `WineShopPOS-Owner-Agent`
./docs/ai/DEPLOYMENT_METADATA.md:14:- Function App: `wineshoppos-ai-1a61d5885c`
./docs/ai/DEPLOYMENT_METADATA.md:15:- Function base URL: `https://wineshoppos-ai-1a61d5885c.azurewebsites.net`
./docs/ai/DEPLOYMENT_RUNBOOK.md:7:- Function: `wineshoppos-ai-1a61d5885c`
./docs/ai/DEPLOYMENT_RUNBOOK.md:10:- Foundry account: `wineshoppos-ai-in-1a61d5885c`
./docs/ai/DEPLOYMENT_RUNBOOK.md:11:- Foundry project: `wineshoppos-ai`
./docs/ai/DEPLOYMENT_RUNBOOK.md:12:- Foundry region: South India
./docs/ai/DEPLOYMENT_RUNBOOK.md:13:- Model: `gpt-5-mini`
./docs/ai/DEPLOYMENT_RUNBOOK.md:14:- Agent: `WineShopPOS-Owner-Agent`
./docs/ai/DEPLOYMENT_RUNBOOK.md:20:3. New production Foundry deployment must remain in approved India region(s).
./docs/ai/DEPLOYMENT_RUNBOOK.md:25:8. Use current Foundry `agent_reference` invocation.
./docs/ai/DEPLOYMENT_RUNBOOK.md:28:## Current Foundry RBAC requirement
./docs/ai/DEPLOYMENT_RUNBOOK.md:30:Because the Function uses `AIProjectClient` project-level Conversations/Responses APIs, grant the Function system-assigned managed identity **Foundry User** on the WineShopPOS Foundry **project** scope.
./docs/ai/DEPLOYMENT_RUNBOOK.md:49:The earlier East US Foundry account is not production. Remove it only after final dependency review.
./docs/ai/SECURITY_AND_TENANT_ISOLATION.md:47:- **Foundry User**
./docs/ai/SECURITY_AND_TENANT_ISOLATION.md:48:- scope: WineShopPOS Foundry project
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:36:Microsoft Foundry project
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:39:WineShopPOS-Owner-Agent
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:40:gpt-5-mini
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:52:- AI Function App: `wineshoppos-ai-1a61d5885c`
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:56:- Production Foundry account: `wineshoppos-ai-in-1a61d5885c`
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:57:- Foundry region: South India
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:58:- Foundry project: `wineshoppos-ai`
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:59:- Model deployment: `gpt-5-mini`
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:62:- Logical agent: `WineShopPOS-Owner-Agent`
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:63:- Foundry invocation: current `agent_reference` request shape
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:67:The Azure Function uses its **system-assigned managed identity** for Foundry access.
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:69:The working runtime uses `AIProjectClient` plus project-level Responses/Conversations APIs. For this architecture, the Function managed identity requires **Foundry User at the Foundry project scope**. The narrower Agent Consumer role alone was insufficient and produced HTTP 403 during the project-level runtime call.
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:71:This role is scoped to the WineShopPOS Foundry project, not the whole subscription.
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:109:- direct Foundry `agent_reference` invocation
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:110:- Foundry function-call loop
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:112:- function-call outputs returned to Foundry
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:115:- Function managed identity access to the South India Foundry project
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:116:- production `/api/ai/chat` path after the Foundry project RBAC correction
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:122:The earlier East US Foundry resource is **not the production AI resource**. Production uses the South India account listed above. The East US Foundry resource may be removed after the final cleanup review confirms no dependency remains.
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:124:### Observability/evaluation status
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:128:- Full Foundry trace connection, production AI quality evaluation, dashboards and automated quality gates are the **next AI operational-hardening milestone**.
./docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md:129:- Do not claim continuous Foundry evaluation is already enabled until that work is completed.
./docs/chapters/24-owner-controls-audit.md:6:Provide traceability for commercial operations.
./docs/code-history/ai-owner-assistant-v1.md:13:- Microsoft Foundry project/model/agent
./docs/code-history/ai-owner-assistant-v1.md:21:### Legacy East US Foundry resource
./docs/code-history/ai-owner-assistant-v1.md:23:An early deployment attempt created an East US Foundry resource. It is not the production AI resource. Production was moved to a dedicated South India Foundry account.
./docs/code-history/ai-owner-assistant-v1.md:29:### Foundry request shape
./docs/code-history/ai-owner-assistant-v1.md:33:`The 'agent' property is deprecated. Use 'agent_reference' instead.`
./docs/code-history/ai-owner-assistant-v1.md:35:Runtime was corrected to `agent_reference`.
./docs/code-history/ai-owner-assistant-v1.md:39:Direct local Foundry tests succeeded under the signed-in Azure developer identity, while the Azure Function returned HTTP 403.
./docs/code-history/ai-owner-assistant-v1.md:41:Root cause: the Function used project-level AIProjectClient Conversations/Responses APIs, while its managed identity had only Agent Consumer. The working fix was Foundry User at the WineShopPOS Foundry project scope.
./docs/code-history/ai-owner-assistant-v1.md:47:A full local Foundry/tool loop passed.
./docs/code-history/ai-owner-assistant-v1.md:49:The real Azure Function → Foundry → Supabase tool loop → final answer passed after the RBAC correction.
./docs/code-history/chapter-17-code.md:38:  async function review(id,action){const fn=action==="approve"?"approve_return_request":"reject_return_request";const args=action==="approve"?{p_request_id:id}:{p_request_id:id,p_note:"Rejected by manager"};const{error}=await supabase.rpc(fn,args);setMessage(error?error.message:`Return ${action}d.`);if(!error){await Promise.all([load(),refreshAll()])}}
./docs/code-history/chapter-17-code.md:309:alter table public.payments add column if not exists return_request_id uuid;
./docs/code-history/chapter-17-code.md:358:  return_request_id uuid not null references public.sale_return_requests(id) on delete cascade,
./docs/code-history/chapter-17-code.md:368:create index if not exists idx_return_items_request on public.sale_return_items(return_request_id);
./docs/code-history/chapter-17-code.md:797:    join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-17-code.md:802:    insert into public.sale_return_items(shop_id,return_request_id,sale_item_id,product_id,quantity,unit_refund,line_refund)
./docs/code-history/chapter-17-code.md:814:create or replace function public.approve_return_request(p_request_id uuid)
./docs/code-history/chapter-17-code.md:832:  select * into v_req from public.sale_return_requests where id=p_request_id and shop_id=v_shop for update;
./docs/code-history/chapter-17-code.md:836:  for r in select * from public.sale_return_items where return_request_id=p_request_id
./docs/code-history/chapter-17-code.md:843:    values(v_shop,r.product_id,'CUSTOMER_RETURN',r.quantity,v_before,v_after,'SALE_RETURN',p_request_id,'Approved customer return',auth.uid());
./docs/code-history/chapter-17-code.md:847:  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,return_request_id,shift_id)
./docs/code-history/chapter-17-code.md:848:  values(v_shop,v_req.sale_id,v_req.refund_method,v_req.total_refund,v_req.refund_reference,'REFUND',p_request_id,v_shift);
./docs/code-history/chapter-17-code.md:850:  update public.sale_return_requests set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_request_id;
./docs/code-history/chapter-17-code.md:854:  from public.sale_return_items sri join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-17-code.md:861:  perform public.write_audit(v_shop,'RETURN_APPROVED','sale_return_request',p_request_id::text,null,to_jsonb(v_req),jsonb_build_object('refund',v_req.total_refund));
./docs/code-history/chapter-17-code.md:865:create or replace function public.reject_return_request(p_request_id uuid, p_note text default null)
./docs/code-history/chapter-17-code.md:876:  where id=p_request_id and shop_id=v_shop and status='PENDING';
./docs/code-history/chapter-17-code.md:878:  perform public.write_audit(v_shop,'RETURN_REJECTED','sale_return_request',p_request_id::text,null,null,jsonb_build_object('note',p_note));
./docs/code-history/chapter-17-code.md:1634:  shop_id=public.current_shop_id() and exists(select 1 from public.sale_return_requests r where r.id=return_request_id)
./docs/code-history/chapter-18-code.md:133:alter table public.payments add column if not exists return_request_id uuid;
./docs/code-history/chapter-18-code.md:182:  return_request_id uuid not null references public.sale_return_requests(id) on delete cascade,
./docs/code-history/chapter-18-code.md:192:create index if not exists idx_return_items_request on public.sale_return_items(return_request_id);
./docs/code-history/chapter-18-code.md:621:    join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-18-code.md:626:    insert into public.sale_return_items(shop_id,return_request_id,sale_item_id,product_id,quantity,unit_refund,line_refund)
./docs/code-history/chapter-18-code.md:638:create or replace function public.approve_return_request(p_request_id uuid)
./docs/code-history/chapter-18-code.md:656:  select * into v_req from public.sale_return_requests where id=p_request_id and shop_id=v_shop for update;
./docs/code-history/chapter-18-code.md:660:  for r in select * from public.sale_return_items where return_request_id=p_request_id
./docs/code-history/chapter-18-code.md:667:    values(v_shop,r.product_id,'CUSTOMER_RETURN',r.quantity,v_before,v_after,'SALE_RETURN',p_request_id,'Approved customer return',auth.uid());
./docs/code-history/chapter-18-code.md:671:  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,return_request_id,shift_id)
./docs/code-history/chapter-18-code.md:672:  values(v_shop,v_req.sale_id,v_req.refund_method,v_req.total_refund,v_req.refund_reference,'REFUND',p_request_id,v_shift);
./docs/code-history/chapter-18-code.md:674:  update public.sale_return_requests set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_request_id;
./docs/code-history/chapter-18-code.md:678:  from public.sale_return_items sri join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-18-code.md:685:  perform public.write_audit(v_shop,'RETURN_APPROVED','sale_return_request',p_request_id::text,null,to_jsonb(v_req),jsonb_build_object('refund',v_req.total_refund));
./docs/code-history/chapter-18-code.md:689:create or replace function public.reject_return_request(p_request_id uuid, p_note text default null)
./docs/code-history/chapter-18-code.md:700:  where id=p_request_id and shop_id=v_shop and status='PENDING';
./docs/code-history/chapter-18-code.md:702:  perform public.write_audit(v_shop,'RETURN_REJECTED','sale_return_request',p_request_id::text,null,null,jsonb_build_object('note',p_note));
./docs/code-history/chapter-18-code.md:1458:  shop_id=public.current_shop_id() and exists(select 1 from public.sale_return_requests r where r.id=return_request_id)
./docs/code-history/chapter-19-code.md:288:alter table public.payments add column if not exists return_request_id uuid;
./docs/code-history/chapter-19-code.md:337:  return_request_id uuid not null references public.sale_return_requests(id) on delete cascade,
./docs/code-history/chapter-19-code.md:347:create index if not exists idx_return_items_request on public.sale_return_items(return_request_id);
./docs/code-history/chapter-19-code.md:776:    join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-19-code.md:781:    insert into public.sale_return_items(shop_id,return_request_id,sale_item_id,product_id,quantity,unit_refund,line_refund)
./docs/code-history/chapter-19-code.md:793:create or replace function public.approve_return_request(p_request_id uuid)
./docs/code-history/chapter-19-code.md:811:  select * into v_req from public.sale_return_requests where id=p_request_id and shop_id=v_shop for update;
./docs/code-history/chapter-19-code.md:815:  for r in select * from public.sale_return_items where return_request_id=p_request_id
./docs/code-history/chapter-19-code.md:822:    values(v_shop,r.product_id,'CUSTOMER_RETURN',r.quantity,v_before,v_after,'SALE_RETURN',p_request_id,'Approved customer return',auth.uid());
./docs/code-history/chapter-19-code.md:826:  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,return_request_id,shift_id)
./docs/code-history/chapter-19-code.md:827:  values(v_shop,v_req.sale_id,v_req.refund_method,v_req.total_refund,v_req.refund_reference,'REFUND',p_request_id,v_shift);
./docs/code-history/chapter-19-code.md:829:  update public.sale_return_requests set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_request_id;
./docs/code-history/chapter-19-code.md:833:  from public.sale_return_items sri join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-19-code.md:840:  perform public.write_audit(v_shop,'RETURN_APPROVED','sale_return_request',p_request_id::text,null,to_jsonb(v_req),jsonb_build_object('refund',v_req.total_refund));
./docs/code-history/chapter-19-code.md:844:create or replace function public.reject_return_request(p_request_id uuid, p_note text default null)
./docs/code-history/chapter-19-code.md:855:  where id=p_request_id and shop_id=v_shop and status='PENDING';
./docs/code-history/chapter-19-code.md:857:  perform public.write_audit(v_shop,'RETURN_REJECTED','sale_return_request',p_request_id::text,null,null,jsonb_build_object('note',p_note));
./docs/code-history/chapter-19-code.md:1613:  shop_id=public.current_shop_id() and exists(select 1 from public.sale_return_requests r where r.id=return_request_id)
./docs/code-history/chapter-21-code.md:137:alter table public.payments add column if not exists return_request_id uuid;
./docs/code-history/chapter-21-code.md:186:  return_request_id uuid not null references public.sale_return_requests(id) on delete cascade,
./docs/code-history/chapter-21-code.md:196:create index if not exists idx_return_items_request on public.sale_return_items(return_request_id);
./docs/code-history/chapter-21-code.md:625:    join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-21-code.md:630:    insert into public.sale_return_items(shop_id,return_request_id,sale_item_id,product_id,quantity,unit_refund,line_refund)
./docs/code-history/chapter-21-code.md:642:create or replace function public.approve_return_request(p_request_id uuid)
./docs/code-history/chapter-21-code.md:660:  select * into v_req from public.sale_return_requests where id=p_request_id and shop_id=v_shop for update;
./docs/code-history/chapter-21-code.md:664:  for r in select * from public.sale_return_items where return_request_id=p_request_id
./docs/code-history/chapter-21-code.md:671:    values(v_shop,r.product_id,'CUSTOMER_RETURN',r.quantity,v_before,v_after,'SALE_RETURN',p_request_id,'Approved customer return',auth.uid());
./docs/code-history/chapter-21-code.md:675:  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,return_request_id,shift_id)
./docs/code-history/chapter-21-code.md:676:  values(v_shop,v_req.sale_id,v_req.refund_method,v_req.total_refund,v_req.refund_reference,'REFUND',p_request_id,v_shift);
./docs/code-history/chapter-21-code.md:678:  update public.sale_return_requests set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_request_id;
./docs/code-history/chapter-21-code.md:682:  from public.sale_return_items sri join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-21-code.md:689:  perform public.write_audit(v_shop,'RETURN_APPROVED','sale_return_request',p_request_id::text,null,to_jsonb(v_req),jsonb_build_object('refund',v_req.total_refund));
./docs/code-history/chapter-21-code.md:693:create or replace function public.reject_return_request(p_request_id uuid, p_note text default null)
./docs/code-history/chapter-21-code.md:704:  where id=p_request_id and shop_id=v_shop and status='PENDING';
./docs/code-history/chapter-21-code.md:706:  perform public.write_audit(v_shop,'RETURN_REJECTED','sale_return_request',p_request_id::text,null,null,jsonb_build_object('note',p_note));
./docs/code-history/chapter-21-code.md:1462:  shop_id=public.current_shop_id() and exists(select 1 from public.sale_return_requests r where r.id=return_request_id)
./docs/code-history/chapter-22-code.md:100:alter table public.payments add column if not exists return_request_id uuid;
./docs/code-history/chapter-22-code.md:149:  return_request_id uuid not null references public.sale_return_requests(id) on delete cascade,
./docs/code-history/chapter-22-code.md:159:create index if not exists idx_return_items_request on public.sale_return_items(return_request_id);
./docs/code-history/chapter-22-code.md:588:    join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-22-code.md:593:    insert into public.sale_return_items(shop_id,return_request_id,sale_item_id,product_id,quantity,unit_refund,line_refund)
./docs/code-history/chapter-22-code.md:605:create or replace function public.approve_return_request(p_request_id uuid)
./docs/code-history/chapter-22-code.md:623:  select * into v_req from public.sale_return_requests where id=p_request_id and shop_id=v_shop for update;
./docs/code-history/chapter-22-code.md:627:  for r in select * from public.sale_return_items where return_request_id=p_request_id
./docs/code-history/chapter-22-code.md:634:    values(v_shop,r.product_id,'CUSTOMER_RETURN',r.quantity,v_before,v_after,'SALE_RETURN',p_request_id,'Approved customer return',auth.uid());
./docs/code-history/chapter-22-code.md:638:  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,return_request_id,shift_id)
./docs/code-history/chapter-22-code.md:639:  values(v_shop,v_req.sale_id,v_req.refund_method,v_req.total_refund,v_req.refund_reference,'REFUND',p_request_id,v_shift);
./docs/code-history/chapter-22-code.md:641:  update public.sale_return_requests set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_request_id;
./docs/code-history/chapter-22-code.md:645:  from public.sale_return_items sri join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-22-code.md:652:  perform public.write_audit(v_shop,'RETURN_APPROVED','sale_return_request',p_request_id::text,null,to_jsonb(v_req),jsonb_build_object('refund',v_req.total_refund));
./docs/code-history/chapter-22-code.md:656:create or replace function public.reject_return_request(p_request_id uuid, p_note text default null)
./docs/code-history/chapter-22-code.md:667:  where id=p_request_id and shop_id=v_shop and status='PENDING';
./docs/code-history/chapter-22-code.md:669:  perform public.write_audit(v_shop,'RETURN_REJECTED','sale_return_request',p_request_id::text,null,null,jsonb_build_object('note',p_note));
./docs/code-history/chapter-22-code.md:1425:  shop_id=public.current_shop_id() and exists(select 1 from public.sale_return_requests r where r.id=return_request_id)
./docs/code-history/chapter-23-code.md:105:alter table public.payments add column if not exists return_request_id uuid;
./docs/code-history/chapter-23-code.md:154:  return_request_id uuid not null references public.sale_return_requests(id) on delete cascade,
./docs/code-history/chapter-23-code.md:164:create index if not exists idx_return_items_request on public.sale_return_items(return_request_id);
./docs/code-history/chapter-23-code.md:593:    join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-23-code.md:598:    insert into public.sale_return_items(shop_id,return_request_id,sale_item_id,product_id,quantity,unit_refund,line_refund)
./docs/code-history/chapter-23-code.md:610:create or replace function public.approve_return_request(p_request_id uuid)
./docs/code-history/chapter-23-code.md:628:  select * into v_req from public.sale_return_requests where id=p_request_id and shop_id=v_shop for update;
./docs/code-history/chapter-23-code.md:632:  for r in select * from public.sale_return_items where return_request_id=p_request_id
./docs/code-history/chapter-23-code.md:639:    values(v_shop,r.product_id,'CUSTOMER_RETURN',r.quantity,v_before,v_after,'SALE_RETURN',p_request_id,'Approved customer return',auth.uid());
./docs/code-history/chapter-23-code.md:643:  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,return_request_id,shift_id)
./docs/code-history/chapter-23-code.md:644:  values(v_shop,v_req.sale_id,v_req.refund_method,v_req.total_refund,v_req.refund_reference,'REFUND',p_request_id,v_shift);
./docs/code-history/chapter-23-code.md:646:  update public.sale_return_requests set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_request_id;
./docs/code-history/chapter-23-code.md:650:  from public.sale_return_items sri join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-23-code.md:657:  perform public.write_audit(v_shop,'RETURN_APPROVED','sale_return_request',p_request_id::text,null,to_jsonb(v_req),jsonb_build_object('refund',v_req.total_refund));
./docs/code-history/chapter-23-code.md:661:create or replace function public.reject_return_request(p_request_id uuid, p_note text default null)
./docs/code-history/chapter-23-code.md:672:  where id=p_request_id and shop_id=v_shop and status='PENDING';
./docs/code-history/chapter-23-code.md:674:  perform public.write_audit(v_shop,'RETURN_REJECTED','sale_return_request',p_request_id::text,null,null,jsonb_build_object('note',p_note));
./docs/code-history/chapter-23-code.md:1430:  shop_id=public.current_shop_id() and exists(select 1 from public.sale_return_requests r where r.id=return_request_id)
./docs/code-history/chapter-24-code.md:376:alter table public.payments add column if not exists return_request_id uuid;
./docs/code-history/chapter-24-code.md:425:  return_request_id uuid not null references public.sale_return_requests(id) on delete cascade,
./docs/code-history/chapter-24-code.md:435:create index if not exists idx_return_items_request on public.sale_return_items(return_request_id);
./docs/code-history/chapter-24-code.md:864:    join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-24-code.md:869:    insert into public.sale_return_items(shop_id,return_request_id,sale_item_id,product_id,quantity,unit_refund,line_refund)
./docs/code-history/chapter-24-code.md:881:create or replace function public.approve_return_request(p_request_id uuid)
./docs/code-history/chapter-24-code.md:899:  select * into v_req from public.sale_return_requests where id=p_request_id and shop_id=v_shop for update;
./docs/code-history/chapter-24-code.md:903:  for r in select * from public.sale_return_items where return_request_id=p_request_id
./docs/code-history/chapter-24-code.md:910:    values(v_shop,r.product_id,'CUSTOMER_RETURN',r.quantity,v_before,v_after,'SALE_RETURN',p_request_id,'Approved customer return',auth.uid());
./docs/code-history/chapter-24-code.md:914:  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,return_request_id,shift_id)
./docs/code-history/chapter-24-code.md:915:  values(v_shop,v_req.sale_id,v_req.refund_method,v_req.total_refund,v_req.refund_reference,'REFUND',p_request_id,v_shift);
./docs/code-history/chapter-24-code.md:917:  update public.sale_return_requests set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_request_id;
./docs/code-history/chapter-24-code.md:921:  from public.sale_return_items sri join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-24-code.md:928:  perform public.write_audit(v_shop,'RETURN_APPROVED','sale_return_request',p_request_id::text,null,to_jsonb(v_req),jsonb_build_object('refund',v_req.total_refund));
./docs/code-history/chapter-24-code.md:932:create or replace function public.reject_return_request(p_request_id uuid, p_note text default null)
./docs/code-history/chapter-24-code.md:943:  where id=p_request_id and shop_id=v_shop and status='PENDING';
./docs/code-history/chapter-24-code.md:945:  perform public.write_audit(v_shop,'RETURN_REJECTED','sale_return_request',p_request_id::text,null,null,jsonb_build_object('note',p_note));
./docs/code-history/chapter-24-code.md:1701:  shop_id=public.current_shop_id() and exists(select 1 from public.sale_return_requests r where r.id=return_request_id)
./docs/code-history/chapter-25-code.md:643:alter table public.payments add column if not exists return_request_id uuid;
./docs/code-history/chapter-25-code.md:692:  return_request_id uuid not null references public.sale_return_requests(id) on delete cascade,
./docs/code-history/chapter-25-code.md:702:create index if not exists idx_return_items_request on public.sale_return_items(return_request_id);
./docs/code-history/chapter-25-code.md:1131:    join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-25-code.md:1136:    insert into public.sale_return_items(shop_id,return_request_id,sale_item_id,product_id,quantity,unit_refund,line_refund)
./docs/code-history/chapter-25-code.md:1148:create or replace function public.approve_return_request(p_request_id uuid)
./docs/code-history/chapter-25-code.md:1166:  select * into v_req from public.sale_return_requests where id=p_request_id and shop_id=v_shop for update;
./docs/code-history/chapter-25-code.md:1170:  for r in select * from public.sale_return_items where return_request_id=p_request_id
./docs/code-history/chapter-25-code.md:1177:    values(v_shop,r.product_id,'CUSTOMER_RETURN',r.quantity,v_before,v_after,'SALE_RETURN',p_request_id,'Approved customer return',auth.uid());
./docs/code-history/chapter-25-code.md:1181:  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,return_request_id,shift_id)
./docs/code-history/chapter-25-code.md:1182:  values(v_shop,v_req.sale_id,v_req.refund_method,v_req.total_refund,v_req.refund_reference,'REFUND',p_request_id,v_shift);
./docs/code-history/chapter-25-code.md:1184:  update public.sale_return_requests set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_request_id;
./docs/code-history/chapter-25-code.md:1188:  from public.sale_return_items sri join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-25-code.md:1195:  perform public.write_audit(v_shop,'RETURN_APPROVED','sale_return_request',p_request_id::text,null,to_jsonb(v_req),jsonb_build_object('refund',v_req.total_refund));
./docs/code-history/chapter-25-code.md:1199:create or replace function public.reject_return_request(p_request_id uuid, p_note text default null)
./docs/code-history/chapter-25-code.md:1210:  where id=p_request_id and shop_id=v_shop and status='PENDING';
./docs/code-history/chapter-25-code.md:1212:  perform public.write_audit(v_shop,'RETURN_REJECTED','sale_return_request',p_request_id::text,null,null,jsonb_build_object('note',p_note));
./docs/code-history/chapter-25-code.md:1968:  shop_id=public.current_shop_id() and exists(select 1 from public.sale_return_requests r where r.id=return_request_id)
./docs/code-history/chapter-26-code.md:307:alter table public.payments add column if not exists return_request_id uuid;
./docs/code-history/chapter-26-code.md:356:  return_request_id uuid not null references public.sale_return_requests(id) on delete cascade,
./docs/code-history/chapter-26-code.md:366:create index if not exists idx_return_items_request on public.sale_return_items(return_request_id);
./docs/code-history/chapter-26-code.md:795:    join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-26-code.md:800:    insert into public.sale_return_items(shop_id,return_request_id,sale_item_id,product_id,quantity,unit_refund,line_refund)
./docs/code-history/chapter-26-code.md:812:create or replace function public.approve_return_request(p_request_id uuid)
./docs/code-history/chapter-26-code.md:830:  select * into v_req from public.sale_return_requests where id=p_request_id and shop_id=v_shop for update;
./docs/code-history/chapter-26-code.md:834:  for r in select * from public.sale_return_items where return_request_id=p_request_id
./docs/code-history/chapter-26-code.md:841:    values(v_shop,r.product_id,'CUSTOMER_RETURN',r.quantity,v_before,v_after,'SALE_RETURN',p_request_id,'Approved customer return',auth.uid());
./docs/code-history/chapter-26-code.md:845:  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,return_request_id,shift_id)
./docs/code-history/chapter-26-code.md:846:  values(v_shop,v_req.sale_id,v_req.refund_method,v_req.total_refund,v_req.refund_reference,'REFUND',p_request_id,v_shift);
./docs/code-history/chapter-26-code.md:848:  update public.sale_return_requests set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_request_id;
./docs/code-history/chapter-26-code.md:852:  from public.sale_return_items sri join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapter-26-code.md:859:  perform public.write_audit(v_shop,'RETURN_APPROVED','sale_return_request',p_request_id::text,null,to_jsonb(v_req),jsonb_build_object('refund',v_req.total_refund));
./docs/code-history/chapter-26-code.md:863:create or replace function public.reject_return_request(p_request_id uuid, p_note text default null)
./docs/code-history/chapter-26-code.md:874:  where id=p_request_id and shop_id=v_shop and status='PENDING';
./docs/code-history/chapter-26-code.md:876:  perform public.write_audit(v_shop,'RETURN_REJECTED','sale_return_request',p_request_id::text,null,null,jsonb_build_object('note',p_note));
./docs/code-history/chapter-26-code.md:1632:  shop_id=public.current_shop_id() and exists(select 1 from public.sale_return_requests r where r.id=return_request_id)
./docs/code-history/chapters-16-26-release.md:431:+Provide traceability for commercial operations.
./docs/code-history/chapters-16-26-release.md:819:+Provide traceability for commercial operations.
./docs/code-history/chapters-16-26-release.md:1231:+Provide traceability for commercial operations.
./docs/code-history/chapters-16-26-release.md:4444:+  async function review(id,action){const fn=action==="approve"?"approve_return_request":"reject_return_request";const args=action==="approve"?{p_request_id:id}:{p_request_id:id,p_note:"Rejected by manager"};const{error}=await supabase.rpc(fn,args);setMessage(error?error.message:`Return ${action}d.`);if(!error){await Promise.all([load(),refreshAll()])}}
./docs/code-history/chapters-16-26-release.md:4889:+alter table public.payments add column if not exists return_request_id uuid;
./docs/code-history/chapters-16-26-release.md:4938:+  return_request_id uuid not null references public.sale_return_requests(id) on delete cascade,
./docs/code-history/chapters-16-26-release.md:4948:+create index if not exists idx_return_items_request on public.sale_return_items(return_request_id);
./docs/code-history/chapters-16-26-release.md:5377:+    join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapters-16-26-release.md:5382:+    insert into public.sale_return_items(shop_id,return_request_id,sale_item_id,product_id,quantity,unit_refund,line_refund)
./docs/code-history/chapters-16-26-release.md:5394:+create or replace function public.approve_return_request(p_request_id uuid)
./docs/code-history/chapters-16-26-release.md:5412:+  select * into v_req from public.sale_return_requests where id=p_request_id and shop_id=v_shop for update;
./docs/code-history/chapters-16-26-release.md:5416:+  for r in select * from public.sale_return_items where return_request_id=p_request_id
./docs/code-history/chapters-16-26-release.md:5423:+    values(v_shop,r.product_id,'CUSTOMER_RETURN',r.quantity,v_before,v_after,'SALE_RETURN',p_request_id,'Approved customer return',auth.uid());
./docs/code-history/chapters-16-26-release.md:5427:+  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,return_request_id,shift_id)
./docs/code-history/chapters-16-26-release.md:5428:+  values(v_shop,v_req.sale_id,v_req.refund_method,v_req.total_refund,v_req.refund_reference,'REFUND',p_request_id,v_shift);
./docs/code-history/chapters-16-26-release.md:5430:+  update public.sale_return_requests set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_request_id;
./docs/code-history/chapters-16-26-release.md:5434:+  from public.sale_return_items sri join public.sale_return_requests rr on rr.id=sri.return_request_id
./docs/code-history/chapters-16-26-release.md:5441:+  perform public.write_audit(v_shop,'RETURN_APPROVED','sale_return_request',p_request_id::text,null,to_jsonb(v_req),jsonb_build_object('refund',v_req.total_refund));
./docs/code-history/chapters-16-26-release.md:5445:+create or replace function public.reject_return_request(p_request_id uuid, p_note text default null)
./docs/code-history/chapters-16-26-release.md:5456:+  where id=p_request_id and shop_id=v_shop and status='PENDING';
./docs/code-history/chapters-16-26-release.md:5458:+  perform public.write_audit(v_shop,'RETURN_REJECTED','sale_return_request',p_request_id::text,null,null,jsonb_build_object('note',p_note));
./docs/code-history/chapters-16-26-release.md:6214:+  shop_id=public.current_shop_id() and exists(select 1 from public.sale_return_requests r where r.id=return_request_id)
./docs/code-history/master-reconsolidation-release.md:1479:+async function act(item,action){setBusy(`${item.type}-${item.id}`);let fn,args;if(item.type==="RETURN"){fn=action==="approve"?"approve_return_request":"reject_return_request";args=action==="approve"?{p_request_id:item.id}:{p_request_id:item.id,p_note:"Rejected from Approval Center"}}else if(item.type==="SHIFT"){fn="approve_shift_close";args={p_shift_id:item.id,p_notes:"Approved from Approval Center"}}else if(item.type==="STOCK_COUNT"){fn="approve_stock_count";args={p_stock_count_id:item.id}}else if(item.type==="TRANSFER"){fn=action==="approve"?"approve_stock_transfer":"reject_stock_transfer";args=action==="approve"?{p_transfer_id:item.id}:{p_transfer_id:item.id,p_note:"Rejected from Approval Center"}}else{fn=action==="approve"?"approve_purchase_order":"set_purchase_order_status";args=action==="approve"?{p_po_id:item.id}:{p_po_id:item.id,p_status:"CANCELLED"}}const{error}=await supabase.rpc(fn,args);setMessage(error?"Approval action could not be completed. Refresh and verify its current status.":`${item.type.replaceAll("_"," ")} ${action}d.`);if(!error)await load();setBusy("")}
./docs/code-history/master-reconsolidation-release.md:6617:async function act(item,action){setBusy(`${item.type}-${item.id}`);let fn,args;if(item.type==="RETURN"){fn=action==="approve"?"approve_return_request":"reject_return_request";args=action==="approve"?{p_request_id:item.id}:{p_request_id:item.id,p_note:"Rejected from Approval Center"}}else if(item.type==="SHIFT"){fn="approve_shift_close";args={p_shift_id:item.id,p_notes:"Approved from Approval Center"}}else if(item.type==="STOCK_COUNT"){fn="approve_stock_count";args={p_stock_count_id:item.id}}else if(item.type==="TRANSFER"){fn=action==="approve"?"approve_stock_transfer":"reject_stock_transfer";args=action==="approve"?{p_transfer_id:item.id}:{p_transfer_id:item.id,p_note:"Rejected from Approval Center"}}else{fn=action==="approve"?"approve_purchase_order":"set_purchase_order_status";args=action==="approve"?{p_po_id:item.id}:{p_po_id:item.id,p_status:"CANCELLED"}}const{error}=await supabase.rpc(fn,args);setMessage(error?"Approval action could not be completed. Refresh and verify its current status.":`${item.type.replaceAll("_"," ")} ${action}d.`);if(!error)await load();setBusy("")}
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:124:WineShopPOS added a read-only, multi-tenant AI Owner Assistant milestone. It uses one Microsoft Foundry model deployment, one logical WineShopPOS Owner Agent, an Azure Function trust boundary, caller-scoped Supabase authorization and narrow deterministic analytics RPCs. AI is ADMIN/Owner Center only and cannot write business transactions. Tenant/shop access is resolved programmatically from `user_shop_memberships`; the model never decides tenant access.
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:147:Microsoft Foundry project
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:150:WineShopPOS-Owner-Agent
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:151:gpt-5-mini
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:163:- AI Function App: `wineshoppos-ai-1a61d5885c`
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:167:- Production Foundry account: `wineshoppos-ai-in-1a61d5885c`
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:168:- Foundry region: South India
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:169:- Foundry project: `wineshoppos-ai`
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:170:- Model deployment: `gpt-5-mini`
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:173:- Logical agent: `WineShopPOS-Owner-Agent`
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:174:- Foundry invocation: current `agent_reference` request shape
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:178:The Azure Function uses its **system-assigned managed identity** for Foundry access.
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:180:The working runtime uses `AIProjectClient` plus project-level Responses/Conversations APIs. For this architecture, the Function managed identity requires **Foundry User at the Foundry project scope**. The narrower Agent Consumer role alone was insufficient and produced HTTP 403 during the project-level runtime call.
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:182:This role is scoped to the WineShopPOS Foundry project, not the whole subscription.
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:220:- direct Foundry `agent_reference` invocation
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:221:- Foundry function-call loop
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:223:- function-call outputs returned to Foundry
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:226:- Function managed identity access to the South India Foundry project
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:227:- production `/api/ai/chat` path after the Foundry project RBAC correction
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:233:The earlier East US Foundry resource is **not the production AI resource**. Production uses the South India account listed above. The East US Foundry resource may be removed after the final cleanup review confirms no dependency remains.
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:235:### Observability/evaluation status
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:239:- Full Foundry trace connection, production AI quality evaluation, dashboards and automated quality gates are the **next AI operational-hardening milestone**.
./docs/code-history/V2_PREVIOUS_docs_PROJECT_CONTEXT.md_20260830_065028.md:240:- Do not claim continuous Foundry evaluation is already enabled until that work is completed.
./docs/code-history/V2_PREVIOUS_docs_README.md_20260830_065028.md:36:- Microsoft Foundry for Ask WineShopPOS PRO
./docs/code-history/V2_PREVIOUS_docs_README.md_20260830_065028.md:45:- Foundry: South India
./docs/code-history/V2_PREVIOUS_docs_README.md_20260830_065028.md:46:- Model: `gpt-5-mini`
./docs/code-history/V2_PREVIOUS_docs_README.md_20260830_065028.md:47:- Agent: `WineShopPOS-Owner-Agent`
./docs/code-history/V2_PREVIOUS_docs_README.md_20260830_065028.md:72:- `ai/AI_OBSERVABILITY_EVALUATION_PLAN.md`
./docs/code-history/V2_PREVIOUS_README.md_20260830_065028.md:33:- AI: Microsoft Foundry, South India, `gpt-5-mini`
./docs/handbook/WineShopPOS_Developer_Handbook_Ch16_26.md:296:Provide traceability for commercial operations.
./docs/handoff/AI_CLOUD_POLICY_LATEST.txt:7:wineshoppos-ai-1a61d5885c
./docs/handoff/AI_CLOUD_POLICY_LATEST.txt:12:FOUNDRY PRODUCTION
./docs/handoff/AI_CLOUD_POLICY_LATEST.txt:13:wineshoppos-ai-in-1a61d5885c
./docs/handoff/AI_CLOUD_POLICY_LATEST.txt:15:Project: wineshoppos-ai
./docs/handoff/AI_CLOUD_POLICY_LATEST.txt:16:Model: gpt-5-mini
./docs/handoff/AI_CLOUD_POLICY_LATEST.txt:17:Agent: WineShopPOS-Owner-Agent
./docs/handoff/AI_CLOUD_POLICY_LATEST.txt:21:Foundry User at project scope for the current AIProjectClient Conversations/Responses architecture
./docs/handoff/NEXT_CHAT_CONTEXT.txt:142:Microsoft Foundry project
./docs/handoff/NEXT_CHAT_CONTEXT.txt:145:WineShopPOS-Owner-Agent
./docs/handoff/NEXT_CHAT_CONTEXT.txt:146:gpt-5-mini
./docs/handoff/NEXT_CHAT_CONTEXT.txt:158:- AI Function App: `wineshoppos-ai-1a61d5885c`
./docs/handoff/NEXT_CHAT_CONTEXT.txt:162:- Production Foundry account: `wineshoppos-ai-in-1a61d5885c`
./docs/handoff/NEXT_CHAT_CONTEXT.txt:163:- Foundry region: South India
./docs/handoff/NEXT_CHAT_CONTEXT.txt:164:- Foundry project: `wineshoppos-ai`
./docs/handoff/NEXT_CHAT_CONTEXT.txt:165:- Model deployment: `gpt-5-mini`
./docs/handoff/NEXT_CHAT_CONTEXT.txt:168:- Logical agent: `WineShopPOS-Owner-Agent`
./docs/handoff/NEXT_CHAT_CONTEXT.txt:169:- Foundry invocation: current `agent_reference` request shape
./docs/handoff/NEXT_CHAT_CONTEXT.txt:173:The Azure Function uses its **system-assigned managed identity** for Foundry access.
./docs/handoff/NEXT_CHAT_CONTEXT.txt:175:The working runtime uses `AIProjectClient` plus project-level Responses/Conversations APIs. For this architecture, the Function managed identity requires **Foundry User at the Foundry project scope**. The narrower Agent Consumer role alone was insufficient and produced HTTP 403 during the project-level runtime call.
./docs/handoff/NEXT_CHAT_CONTEXT.txt:177:This role is scoped to the WineShopPOS Foundry project, not the whole subscription.
./docs/handoff/NEXT_CHAT_CONTEXT.txt:215:- direct Foundry `agent_reference` invocation
./docs/handoff/NEXT_CHAT_CONTEXT.txt:216:- Foundry function-call loop
./docs/handoff/NEXT_CHAT_CONTEXT.txt:218:- function-call outputs returned to Foundry
./docs/handoff/NEXT_CHAT_CONTEXT.txt:221:- Function managed identity access to the South India Foundry project
./docs/handoff/NEXT_CHAT_CONTEXT.txt:222:- production `/api/ai/chat` path after the Foundry project RBAC correction
./docs/handoff/NEXT_CHAT_CONTEXT.txt:228:The earlier East US Foundry resource is **not the production AI resource**. Production uses the South India account listed above. The East US Foundry resource may be removed after the final cleanup review confirms no dependency remains.
./docs/handoff/NEXT_CHAT_CONTEXT.txt:230:### Observability/evaluation status
./docs/handoff/NEXT_CHAT_CONTEXT.txt:234:- Full Foundry trace connection, production AI quality evaluation, dashboards and automated quality gates are the **next AI operational-hardening milestone**.
./docs/handoff/NEXT_CHAT_CONTEXT.txt:235:- Do not claim continuous Foundry evaluation is already enabled until that work is completed.
./docs/handoff/NEXT_CHAT_CONTEXT_AI_V1.txt:10:- Function: wineshoppos-ai-1a61d5885c
./docs/handoff/NEXT_CHAT_CONTEXT_AI_V1.txt:12:- Foundry account: wineshoppos-ai-in-1a61d5885c
./docs/handoff/NEXT_CHAT_CONTEXT_AI_V1.txt:13:- Foundry project: wineshoppos-ai
./docs/handoff/NEXT_CHAT_CONTEXT_AI_V1.txt:14:- Foundry region: South India
./docs/handoff/NEXT_CHAT_CONTEXT_AI_V1.txt:15:- Model: gpt-5-mini
./docs/handoff/NEXT_CHAT_CONTEXT_AI_V1.txt:16:- Agent: WineShopPOS-Owner-Agent
./docs/handoff/NEXT_CHAT_CONTEXT_AI_V1.txt:24:Current Foundry runtime uses project-level AIProjectClient Conversations/Responses APIs and requires Foundry User at project scope.
./docs/handoff/NEXT_CHAT_CONTEXT_AI_V1.txt:25:Use agent_reference, not deprecated body.agent.
./docs/handoff/NEXT_CHAT_CONTEXT_AI_V1.txt:32:- Foundry function calls
./docs/handoff/NEXT_CHAT_CONTEXT_AI_V1.txt:38:Application Insights / Foundry tracing + evaluation + quality gates.
./docs/handoff/NEXT_CHAT_CONTEXT_AI_V1.txt:39:Do not claim full continuous Foundry evaluation is complete yet.
./docs/handoff/NEXT_CHAT_CONTEXT_AI_V1.txt:42:Old East US Foundry resource is cleanup-only; production is South India.
./docs/PROJECT_CONTEXT.md:44:- Function App: `wineshoppos-ai-1a61d5885c`
./docs/PROJECT_CONTEXT.md:49:### Microsoft Foundry
./docs/PROJECT_CONTEXT.md:51:- Production resource: `wineshoppos-ai-in-1a61d5885c`
./docs/PROJECT_CONTEXT.md:53:- Project: `wineshoppos-ai`
./docs/PROJECT_CONTEXT.md:54:- Model deployment: `gpt-5-mini`
./docs/PROJECT_CONTEXT.md:57:- Logical agent: `WineShopPOS-Owner-Agent`
./docs/PROJECT_CONTEXT.md:59:The legacy East US Foundry resource named `wineshoppos-ai-1a61d5885c` is
./docs/PROJECT_CONTEXT.md:60:**not the production Foundry resource** and is cleanup-only after dependency review.
./docs/PROJECT_CONTEXT.md:79:Function → Foundry authentication uses the Function App's **system-assigned
./docs/PROJECT_CONTEXT.md:80:managed identity**. The identity has the required Foundry **User** access at
./docs/PROJECT_CONTEXT.md:95:1. Application Insights / Foundry tracing
./docs/PROJECT_CONTEXT.md:97:3. automated AI evaluations
./docs/reconsolidation/DEPLOYMENT_REPORT.md:63:Microsoft Foundry project
./docs/reconsolidation/DEPLOYMENT_REPORT.md:66:WineShopPOS-Owner-Agent
./docs/reconsolidation/DEPLOYMENT_REPORT.md:67:gpt-5-mini
./docs/reconsolidation/DEPLOYMENT_REPORT.md:79:- AI Function App: `wineshoppos-ai-1a61d5885c`
./docs/reconsolidation/DEPLOYMENT_REPORT.md:83:- Production Foundry account: `wineshoppos-ai-in-1a61d5885c`
./docs/reconsolidation/DEPLOYMENT_REPORT.md:84:- Foundry region: South India
./docs/reconsolidation/DEPLOYMENT_REPORT.md:85:- Foundry project: `wineshoppos-ai`
./docs/reconsolidation/DEPLOYMENT_REPORT.md:86:- Model deployment: `gpt-5-mini`
./docs/reconsolidation/DEPLOYMENT_REPORT.md:89:- Logical agent: `WineShopPOS-Owner-Agent`
./docs/reconsolidation/DEPLOYMENT_REPORT.md:90:- Foundry invocation: current `agent_reference` request shape
./docs/reconsolidation/DEPLOYMENT_REPORT.md:94:The Azure Function uses its **system-assigned managed identity** for Foundry access.
./docs/reconsolidation/DEPLOYMENT_REPORT.md:96:The working runtime uses `AIProjectClient` plus project-level Responses/Conversations APIs. For this architecture, the Function managed identity requires **Foundry User at the Foundry project scope**. The narrower Agent Consumer role alone was insufficient and produced HTTP 403 during the project-level runtime call.
./docs/reconsolidation/DEPLOYMENT_REPORT.md:98:This role is scoped to the WineShopPOS Foundry project, not the whole subscription.
./docs/reconsolidation/DEPLOYMENT_REPORT.md:136:- direct Foundry `agent_reference` invocation
./docs/reconsolidation/DEPLOYMENT_REPORT.md:137:- Foundry function-call loop
./docs/reconsolidation/DEPLOYMENT_REPORT.md:139:- function-call outputs returned to Foundry
./docs/reconsolidation/DEPLOYMENT_REPORT.md:142:- Function managed identity access to the South India Foundry project
./docs/reconsolidation/DEPLOYMENT_REPORT.md:143:- production `/api/ai/chat` path after the Foundry project RBAC correction
./docs/reconsolidation/DEPLOYMENT_REPORT.md:149:The earlier East US Foundry resource is **not the production AI resource**. Production uses the South India account listed above. The East US Foundry resource may be removed after the final cleanup review confirms no dependency remains.
./docs/reconsolidation/DEPLOYMENT_REPORT.md:151:### Observability/evaluation status
./docs/reconsolidation/DEPLOYMENT_REPORT.md:155:- Full Foundry trace connection, production AI quality evaluation, dashboards and automated quality gates are the **next AI operational-hardening milestone**.
./docs/reconsolidation/DEPLOYMENT_REPORT.md:156:- Do not claim continuous Foundry evaluation is already enabled until that work is completed.
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:95:Microsoft Foundry project
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:98:WineShopPOS-Owner-Agent
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:99:gpt-5-mini
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:111:- AI Function App: `wineshoppos-ai-1a61d5885c`
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:115:- Production Foundry account: `wineshoppos-ai-in-1a61d5885c`
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:116:- Foundry region: South India
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:117:- Foundry project: `wineshoppos-ai`
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:118:- Model deployment: `gpt-5-mini`
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:121:- Logical agent: `WineShopPOS-Owner-Agent`
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:122:- Foundry invocation: current `agent_reference` request shape
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:126:The Azure Function uses its **system-assigned managed identity** for Foundry access.
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:128:The working runtime uses `AIProjectClient` plus project-level Responses/Conversations APIs. For this architecture, the Function managed identity requires **Foundry User at the Foundry project scope**. The narrower Agent Consumer role alone was insufficient and produced HTTP 403 during the project-level runtime call.
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:130:This role is scoped to the WineShopPOS Foundry project, not the whole subscription.
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:168:- direct Foundry `agent_reference` invocation
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:169:- Foundry function-call loop
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:171:- function-call outputs returned to Foundry
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:174:- Function managed identity access to the South India Foundry project
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:175:- production `/api/ai/chat` path after the Foundry project RBAC correction
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:181:The earlier East US Foundry resource is **not the production AI resource**. Production uses the South India account listed above. The East US Foundry resource may be removed after the final cleanup review confirms no dependency remains.
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:183:### Observability/evaluation status
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:187:- Full Foundry trace connection, production AI quality evaluation, dashboards and automated quality gates are the **next AI operational-hardening milestone**.
./docs/reconsolidation/IMPLEMENTATION_REPORT.md:188:- Do not claim continuous Foundry evaluation is already enabled until that work is completed.
./docs/reconsolidation/MASTER_IMPLEMENTATION_SPECIFICATION.md:1754:Supabase stack trace
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:63:Microsoft Foundry project
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:66:WineShopPOS-Owner-Agent
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:67:gpt-5-mini
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:79:- AI Function App: `wineshoppos-ai-1a61d5885c`
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:83:- Production Foundry account: `wineshoppos-ai-in-1a61d5885c`
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:84:- Foundry region: South India
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:85:- Foundry project: `wineshoppos-ai`
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:86:- Model deployment: `gpt-5-mini`
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:89:- Logical agent: `WineShopPOS-Owner-Agent`
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:90:- Foundry invocation: current `agent_reference` request shape
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:94:The Azure Function uses its **system-assigned managed identity** for Foundry access.
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:96:The working runtime uses `AIProjectClient` plus project-level Responses/Conversations APIs. For this architecture, the Function managed identity requires **Foundry User at the Foundry project scope**. The narrower Agent Consumer role alone was insufficient and produced HTTP 403 during the project-level runtime call.
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:98:This role is scoped to the WineShopPOS Foundry project, not the whole subscription.
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:136:- direct Foundry `agent_reference` invocation
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:137:- Foundry function-call loop
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:139:- function-call outputs returned to Foundry
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:142:- Function managed identity access to the South India Foundry project
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:143:- production `/api/ai/chat` path after the Foundry project RBAC correction
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:149:The earlier East US Foundry resource is **not the production AI resource**. Production uses the South India account listed above. The East US Foundry resource may be removed after the final cleanup review confirms no dependency remains.
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:151:### Observability/evaluation status
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:155:- Full Foundry trace connection, production AI quality evaluation, dashboards and automated quality gates are the **next AI operational-hardening milestone**.
./docs/reconsolidation/PRODUCTION_RUNBOOK.md:156:- Do not claim continuous Foundry evaluation is already enabled until that work is completed.
./docs/testing/AI_OWNER_ASSISTANT_V1_TEST_MATRIX.md:23:| Foundry `agent_reference` direct call | PASS |
./docs/testing/AI_OWNER_ASSISTANT_V1_TEST_MATRIX.md:25:| full local Foundry tool loop | PASS |
./docs/testing/AI_OWNER_ASSISTANT_V1_TEST_MATRIX.md:32:| Foundry project RBAC corrected | PASS |
./docs/testing/FINAL_SMOKE_TEST.md:40:Microsoft Foundry project
./docs/testing/FINAL_SMOKE_TEST.md:43:WineShopPOS-Owner-Agent
./docs/testing/FINAL_SMOKE_TEST.md:44:gpt-5-mini
./docs/testing/FINAL_SMOKE_TEST.md:56:- AI Function App: `wineshoppos-ai-1a61d5885c`
./docs/testing/FINAL_SMOKE_TEST.md:60:- Production Foundry account: `wineshoppos-ai-in-1a61d5885c`
./docs/testing/FINAL_SMOKE_TEST.md:61:- Foundry region: South India
./docs/testing/FINAL_SMOKE_TEST.md:62:- Foundry project: `wineshoppos-ai`
./docs/testing/FINAL_SMOKE_TEST.md:63:- Model deployment: `gpt-5-mini`
./docs/testing/FINAL_SMOKE_TEST.md:66:- Logical agent: `WineShopPOS-Owner-Agent`
./docs/testing/FINAL_SMOKE_TEST.md:67:- Foundry invocation: current `agent_reference` request shape
./docs/testing/FINAL_SMOKE_TEST.md:71:The Azure Function uses its **system-assigned managed identity** for Foundry access.
./docs/testing/FINAL_SMOKE_TEST.md:73:The working runtime uses `AIProjectClient` plus project-level Responses/Conversations APIs. For this architecture, the Function managed identity requires **Foundry User at the Foundry project scope**. The narrower Agent Consumer role alone was insufficient and produced HTTP 403 during the project-level runtime call.
./docs/testing/FINAL_SMOKE_TEST.md:75:This role is scoped to the WineShopPOS Foundry project, not the whole subscription.
./docs/testing/FINAL_SMOKE_TEST.md:113:- direct Foundry `agent_reference` invocation
./docs/testing/FINAL_SMOKE_TEST.md:114:- Foundry function-call loop
./docs/testing/FINAL_SMOKE_TEST.md:116:- function-call outputs returned to Foundry
./docs/testing/FINAL_SMOKE_TEST.md:119:- Function managed identity access to the South India Foundry project
./docs/testing/FINAL_SMOKE_TEST.md:120:- production `/api/ai/chat` path after the Foundry project RBAC correction
./docs/testing/FINAL_SMOKE_TEST.md:126:The earlier East US Foundry resource is **not the production AI resource**. Production uses the South India account listed above. The East US Foundry resource may be removed after the final cleanup review confirms no dependency remains.
./docs/testing/FINAL_SMOKE_TEST.md:128:### Observability/evaluation status
./docs/testing/FINAL_SMOKE_TEST.md:132:- Full Foundry trace connection, production AI quality evaluation, dashboards and automated quality gates are the **next AI operational-hardening milestone**.
./docs/testing/FINAL_SMOKE_TEST.md:133:- Do not claim continuous Foundry evaluation is already enabled until that work is completed.
./docs/testing/TEST_MATRIX.md:118:Microsoft Foundry project
./docs/testing/TEST_MATRIX.md:121:WineShopPOS-Owner-Agent
./docs/testing/TEST_MATRIX.md:122:gpt-5-mini
./docs/testing/TEST_MATRIX.md:134:- AI Function App: `wineshoppos-ai-1a61d5885c`
./docs/testing/TEST_MATRIX.md:138:- Production Foundry account: `wineshoppos-ai-in-1a61d5885c`
./docs/testing/TEST_MATRIX.md:139:- Foundry region: South India
./docs/testing/TEST_MATRIX.md:140:- Foundry project: `wineshoppos-ai`
./docs/testing/TEST_MATRIX.md:141:- Model deployment: `gpt-5-mini`
./docs/testing/TEST_MATRIX.md:144:- Logical agent: `WineShopPOS-Owner-Agent`
./docs/testing/TEST_MATRIX.md:145:- Foundry invocation: current `agent_reference` request shape
./docs/testing/TEST_MATRIX.md:149:The Azure Function uses its **system-assigned managed identity** for Foundry access.
./docs/testing/TEST_MATRIX.md:151:The working runtime uses `AIProjectClient` plus project-level Responses/Conversations APIs. For this architecture, the Function managed identity requires **Foundry User at the Foundry project scope**. The narrower Agent Consumer role alone was insufficient and produced HTTP 403 during the project-level runtime call.
./docs/testing/TEST_MATRIX.md:153:This role is scoped to the WineShopPOS Foundry project, not the whole subscription.
./docs/testing/TEST_MATRIX.md:191:- direct Foundry `agent_reference` invocation
./docs/testing/TEST_MATRIX.md:192:- Foundry function-call loop
./docs/testing/TEST_MATRIX.md:194:- function-call outputs returned to Foundry
./docs/testing/TEST_MATRIX.md:197:- Function managed identity access to the South India Foundry project
./docs/testing/TEST_MATRIX.md:198:- production `/api/ai/chat` path after the Foundry project RBAC correction
./docs/testing/TEST_MATRIX.md:204:The earlier East US Foundry resource is **not the production AI resource**. Production uses the South India account listed above. The East US Foundry resource may be removed after the final cleanup review confirms no dependency remains.
./docs/testing/TEST_MATRIX.md:206:### Observability/evaluation status
./docs/testing/TEST_MATRIX.md:210:- Full Foundry trace connection, production AI quality evaluation, dashboards and automated quality gates are the **next AI operational-hardening milestone**.
./docs/testing/TEST_MATRIX.md:211:- Do not claim continuous Foundry evaluation is already enabled until that work is completed.
./src/pages/Approvals.jsx:9:async function act(item,action){setBusy(`${item.type}-${item.id}`);let fn,args;if(item.type==="RETURN"){fn=action==="approve"?"approve_return_request":"reject_return_request";args=action==="approve"?{p_request_id:item.id}:{p_request_id:item.id,p_note:"Rejected from Approval Center"}}else if(item.type==="SHIFT"){fn="approve_shift_close";args={p_shift_id:item.id,p_notes:"Approved from Approval Center"}}else if(item.type==="STOCK_COUNT"){fn="approve_stock_count";args={p_stock_count_id:item.id}}else if(item.type==="TRANSFER"){fn=action==="approve"?"approve_stock_transfer":"reject_stock_transfer";args=action==="approve"?{p_transfer_id:item.id}:{p_transfer_id:item.id,p_note:"Rejected from Approval Center"}}else{fn=action==="approve"?"approve_purchase_order":"set_purchase_order_status";args=action==="approve"?{p_po_id:item.id}:{p_po_id:item.id,p_status:"CANCELLED"}}const{error}=await supabase.rpc(fn,args);setMessage(error?"Approval action could not be completed. Refresh and verify its current status.":`${item.type.replaceAll("_"," ")} ${action}d.`);if(!error)await load();setBusy("")}
./src/pages/OwnerAI.jsx:114:        requestId: result.request_id,
./src/pages/Returns.jsx:19:  async function review(id,action){const fn=action==="approve"?"approve_return_request":"reject_return_request";const args=action==="approve"?{p_request_id:id}:{p_request_id:id,p_note:"Rejected by manager"};const{error}=await supabase.rpc(fn,args);setMessage(error?error.message:`Return ${action}d.`);if(!error){await Promise.all([load(),refreshAll()])}}
./supabase/migrations/20260829190000_chapters_16_26.sql:69:alter table public.payments add column if not exists return_request_id uuid;
./supabase/migrations/20260829190000_chapters_16_26.sql:118:  return_request_id uuid not null references public.sale_return_requests(id) on delete cascade,
./supabase/migrations/20260829190000_chapters_16_26.sql:128:create index if not exists idx_return_items_request on public.sale_return_items(return_request_id);
./supabase/migrations/20260829190000_chapters_16_26.sql:557:    join public.sale_return_requests rr on rr.id=sri.return_request_id
./supabase/migrations/20260829190000_chapters_16_26.sql:562:    insert into public.sale_return_items(shop_id,return_request_id,sale_item_id,product_id,quantity,unit_refund,line_refund)
./supabase/migrations/20260829190000_chapters_16_26.sql:574:create or replace function public.approve_return_request(p_request_id uuid)
./supabase/migrations/20260829190000_chapters_16_26.sql:592:  select * into v_req from public.sale_return_requests where id=p_request_id and shop_id=v_shop for update;
./supabase/migrations/20260829190000_chapters_16_26.sql:596:  for r in select * from public.sale_return_items where return_request_id=p_request_id
./supabase/migrations/20260829190000_chapters_16_26.sql:603:    values(v_shop,r.product_id,'CUSTOMER_RETURN',r.quantity,v_before,v_after,'SALE_RETURN',p_request_id,'Approved customer return',auth.uid());
./supabase/migrations/20260829190000_chapters_16_26.sql:607:  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,return_request_id,shift_id)
./supabase/migrations/20260829190000_chapters_16_26.sql:608:  values(v_shop,v_req.sale_id,v_req.refund_method,v_req.total_refund,v_req.refund_reference,'REFUND',p_request_id,v_shift);
./supabase/migrations/20260829190000_chapters_16_26.sql:610:  update public.sale_return_requests set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_request_id;
./supabase/migrations/20260829190000_chapters_16_26.sql:614:  from public.sale_return_items sri join public.sale_return_requests rr on rr.id=sri.return_request_id
./supabase/migrations/20260829190000_chapters_16_26.sql:621:  perform public.write_audit(v_shop,'RETURN_APPROVED','sale_return_request',p_request_id::text,null,to_jsonb(v_req),jsonb_build_object('refund',v_req.total_refund));
./supabase/migrations/20260829190000_chapters_16_26.sql:625:create or replace function public.reject_return_request(p_request_id uuid, p_note text default null)
./supabase/migrations/20260829190000_chapters_16_26.sql:636:  where id=p_request_id and shop_id=v_shop and status='PENDING';
./supabase/migrations/20260829190000_chapters_16_26.sql:638:  perform public.write_audit(v_shop,'RETURN_REJECTED','sale_return_request',p_request_id::text,null,null,jsonb_build_object('note',p_note));
./supabase/migrations/20260829190000_chapters_16_26.sql:1394:  shop_id=public.current_shop_id() and exists(select 1 from public.sale_return_requests r where r.id=return_request_id)
./supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:54:  request_id uuid not null unique,
./supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:234:  p_request_id uuid,
./supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:262:    organization_id,shop_id,user_id,request_id,question_category,tools_called,status,latency_ms
./supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:265:    v_org,v_log_shop,auth.uid(),p_request_id,
./supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:270:  on conflict(request_id) do update set
./WineShopPOS_Ch16_26_Final_Release/source/docs/chapters/24-owner-controls-audit.md:6:Provide traceability for commercial operations.
./WineShopPOS_Ch16_26_Final_Release/source/docs/handbook/WineShopPOS_Developer_Handbook_Ch16_26.md:296:Provide traceability for commercial operations.
./WineShopPOS_Ch16_26_Final_Release/source/src/pages/Returns.jsx:19:  async function review(id,action){const fn=action==="approve"?"approve_return_request":"reject_return_request";const args=action==="approve"?{p_request_id:id}:{p_request_id:id,p_note:"Rejected by manager"};const{error}=await supabase.rpc(fn,args);setMessage(error?error.message:`Return ${action}d.`);if(!error){await Promise.all([load(),refreshAll()])}}
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:69:alter table public.payments add column if not exists return_request_id uuid;
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:118:  return_request_id uuid not null references public.sale_return_requests(id) on delete cascade,
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:128:create index if not exists idx_return_items_request on public.sale_return_items(return_request_id);
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:557:    join public.sale_return_requests rr on rr.id=sri.return_request_id
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:562:    insert into public.sale_return_items(shop_id,return_request_id,sale_item_id,product_id,quantity,unit_refund,line_refund)
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:574:create or replace function public.approve_return_request(p_request_id uuid)
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:592:  select * into v_req from public.sale_return_requests where id=p_request_id and shop_id=v_shop for update;
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:596:  for r in select * from public.sale_return_items where return_request_id=p_request_id
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:603:    values(v_shop,r.product_id,'CUSTOMER_RETURN',r.quantity,v_before,v_after,'SALE_RETURN',p_request_id,'Approved customer return',auth.uid());
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:607:  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,return_request_id,shift_id)
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:608:  values(v_shop,v_req.sale_id,v_req.refund_method,v_req.total_refund,v_req.refund_reference,'REFUND',p_request_id,v_shift);
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:610:  update public.sale_return_requests set status='APPROVED',approved_by=auth.uid(),reviewed_at=now() where id=p_request_id;
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:614:  from public.sale_return_items sri join public.sale_return_requests rr on rr.id=sri.return_request_id
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:621:  perform public.write_audit(v_shop,'RETURN_APPROVED','sale_return_request',p_request_id::text,null,to_jsonb(v_req),jsonb_build_object('refund',v_req.total_refund));
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:625:create or replace function public.reject_return_request(p_request_id uuid, p_note text default null)
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:636:  where id=p_request_id and shop_id=v_shop and status='PENDING';
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:638:  perform public.write_audit(v_shop,'RETURN_REJECTED','sale_return_request',p_request_id::text,null,null,jsonb_build_object('note',p_note));
./WineShopPOS_Ch16_26_Final_Release/source/supabase/migrations/20260829190000_chapters_16_26.sql:1394:  shop_id=public.current_shop_id() and exists(select 1 from public.sale_return_requests r where r.id=return_request_id)
./WineShopPOS_Master_Reconsolidation_Final/source/docs/reconsolidation/MASTER_IMPLEMENTATION_SPECIFICATION.md:1754:Supabase stack trace
./WineShopPOS_Master_Reconsolidation_Final/source/src/pages/Approvals.jsx:9:async function act(item,action){setBusy(`${item.type}-${item.id}`);let fn,args;if(item.type==="RETURN"){fn=action==="approve"?"approve_return_request":"reject_return_request";args=action==="approve"?{p_request_id:item.id}:{p_request_id:item.id,p_note:"Rejected from Approval Center"}}else if(item.type==="SHIFT"){fn="approve_shift_close";args={p_shift_id:item.id,p_notes:"Approved from Approval Center"}}else if(item.type==="STOCK_COUNT"){fn="approve_stock_count";args={p_stock_count_id:item.id}}else if(item.type==="TRANSFER"){fn=action==="approve"?"approve_stock_transfer":"reject_stock_transfer";args=action==="approve"?{p_transfer_id:item.id}:{p_transfer_id:item.id,p_note:"Rejected from Approval Center"}}else{fn=action==="approve"?"approve_purchase_order":"set_purchase_order_status";args=action==="approve"?{p_po_id:item.id}:{p_po_id:item.id,p_status:"CANCELLED"}}const{error}=await supabase.rpc(fn,args);setMessage(error?"Approval action could not be completed. Refresh and verify its current status.":`${item.type.replaceAll("_"," ")} ${action}d.`);if(!error)await load();setBusy("")}
./WineShopPOS_Modern_UI_Role_Access_Update/source/docs/reconsolidation/MASTER_IMPLEMENTATION_SPECIFICATION.md:1754:Supabase stack trace
./WineShopPOS_Modern_UI_Role_Access_Update/source/src/pages/Approvals.jsx:9:async function act(item,action){setBusy(`${item.type}-${item.id}`);let fn,args;if(item.type==="RETURN"){fn=action==="approve"?"approve_return_request":"reject_return_request";args=action==="approve"?{p_request_id:item.id}:{p_request_id:item.id,p_note:"Rejected from Approval Center"}}else if(item.type==="SHIFT"){fn="approve_shift_close";args={p_shift_id:item.id,p_notes:"Approved from Approval Center"}}else if(item.type==="STOCK_COUNT"){fn="approve_stock_count";args={p_stock_count_id:item.id}}else if(item.type==="TRANSFER"){fn=action==="approve"?"approve_stock_transfer":"reject_stock_transfer";args=action==="approve"?{p_transfer_id:item.id}:{p_transfer_id:item.id,p_note:"Rejected from Approval Center"}}else{fn=action==="approve"?"approve_purchase_order":"set_purchase_order_status";args=action==="approve"?{p_po_id:item.id}:{p_po_id:item.id,p_status:"CANCELLED"}}const{error}=await supabase.rpc(fn,args);setMessage(error?"Approval action could not be completed. Refresh and verify its current status.":`${item.type.replaceAll("_"," ")} ${action}d.`);if(!error)await load();setBusy("")}
./wineshoppos_v2_master_executor.sh:382:wineshoppos-ai-1a61d5885c
./wineshoppos_v2_master_executor.sh:391:Microsoft Foundry production environment:
./wineshoppos_v2_master_executor.sh:398:wineshoppos-ai-in-1a61d5885c
./wineshoppos_v2_master_executor.sh:401:wineshoppos-ai
./wineshoppos_v2_master_executor.sh:404:gpt-5-mini
./wineshoppos_v2_master_executor.sh:407:WineShopPOS-Owner-Agent
./wineshoppos_v2_master_executor.sh:425:Foundry Owner Agent
./wineshoppos_v2_master_executor.sh:428:The Function uses managed identity/RBAC for Foundry access.
./wineshoppos_v2_master_executor.sh:434:another Foundry project
./wineshoppos_v2_master_executor.sh:435:another Foundry resource
./wineshoppos_v2_master_executor.sh:450:evaluations
./wineshoppos_v2_master_executor.sh:586:Implement receipt-level stock traceability.
./wineshoppos_v2_master_executor.sh:677:receipt-cost traceability
./wineshoppos_v2_master_executor.sh:1107:Trace:
./wineshoppos_v2_master_executor.sh:1114:Foundry request
./wineshoppos_v2_master_executor.sh:1134:request_id
./wineshoppos_v2_master_executor.sh:1141:# AI-P2 — AUTOMATED EVALUATION SUITE
./wineshoppos_v2_master_executor.sh:1143:Build a golden evaluation dataset.
./wineshoppos_v2_master_executor.sh:1172:groundedness
./wineshoppos_v2_master_executor.sh:1196:groundedness below threshold
./wineshoppos_v2_master_executor.sh:1217:Foundry errors
./wineshoppos_v2_master_executor.sh:1221:evaluation trend
./wineshoppos_v2_master_executor.sh:1503:HTTP 500 stack trace
./wineshoppos_v2_master_executor.sh:2211:trace handler
./wineshoppos_v2_master_executor.sh:2212:trace RPC/API
./wineshoppos_v2_master_executor.sh:2342:create another Foundry Agent
./wineshoppos_v2_master_executor.sh:2364:EVALUATION FAILURE
./wineshoppos_v2_master_executor.sh:2471:evaluations
./wineshoppos_v2_master_executor.sh:2556:test: add ai evaluation quality gates
./wineshoppos_v2_master_executor.sh:2571:Foundry
./wineshoppos_v2_master_executor.sh:2693:[ ] AI evaluations implemented/verified
./wineshoppos_v2_master_executor.sh:2752:existing Foundry project
./wineshoppos_v2_master_executor.sh:2764:current tracing/evaluation status
./wineshoppos_v2_master_executor.sh:2944:- Function App: `wineshoppos-ai-1a61d5885c`
./wineshoppos_v2_master_executor.sh:2949:### Microsoft Foundry
./wineshoppos_v2_master_executor.sh:2951:- Production resource: `wineshoppos-ai-in-1a61d5885c`
./wineshoppos_v2_master_executor.sh:2953:- Project: `wineshoppos-ai`
./wineshoppos_v2_master_executor.sh:2954:- Model deployment: `gpt-5-mini`
./wineshoppos_v2_master_executor.sh:2957:- Logical agent: `WineShopPOS-Owner-Agent`
./wineshoppos_v2_master_executor.sh:2959:The legacy East US Foundry resource named `wineshoppos-ai-1a61d5885c` is
./wineshoppos_v2_master_executor.sh:2960:**not the production Foundry resource** and is cleanup-only after dependency review.
./wineshoppos_v2_master_executor.sh:2979:Function → Foundry authentication uses the Function App's **system-assigned
./wineshoppos_v2_master_executor.sh:2980:managed identity**. The identity has the required Foundry **User** access at
./wineshoppos_v2_master_executor.sh:2995:1. Application Insights / Foundry tracing
./wineshoppos_v2_master_executor.sh:2997:3. automated AI evaluations
./wineshoppos_v2_master_executor.sh:3135:| V2-09 | AI tracing, evaluation, quality gates and monitoring |
./wineshoppos_v2_master_executor.sh:3178:- Function App `wineshoppos-ai-1a61d5885c` — Central India — Consumption Y1
./wineshoppos_v2_master_executor.sh:3179:- Foundry `wineshoppos-ai-in-1a61d5885c` — South India
./wineshoppos_v2_master_executor.sh:3180:- project `wineshoppos-ai`
./wineshoppos_v2_master_executor.sh:3181:- `gpt-5-mini` version `2025-08-07`
./wineshoppos_v2_master_executor.sh:3182:- logical agent `WineShopPOS-Owner-Agent`
./wineshoppos_v2_master_executor.sh:3184:- system-assigned Function managed identity for Foundry
./wineshoppos_v2_master_executor.sh:3223:- receipt/batch lot traceability
./wineshoppos_v2_master_executor.sh:3331:- Application Insights / Foundry tracing
./wineshoppos_v2_master_executor.sh:3332:- request_id correlation
./wineshoppos_v2_master_executor.sh:3333:- golden evaluation dataset
./wineshoppos_v2_master_executor.sh:3334:- groundedness/relevance
./wineshoppos_v2_master_executor.sh:3381:- Function: `wineshoppos-ai-1a61d5885c`
./wineshoppos_v2_master_executor.sh:3384:- Foundry production resource: `wineshoppos-ai-in-1a61d5885c`
./wineshoppos_v2_master_executor.sh:3385:- Foundry region: South India
./wineshoppos_v2_master_executor.sh:3386:- project: `wineshoppos-ai`
./wineshoppos_v2_master_executor.sh:3387:- model: `gpt-5-mini`
./wineshoppos_v2_master_executor.sh:3390:- logical agent: `WineShopPOS-Owner-Agent`
./wineshoppos_v2_master_executor.sh:3394:- Foundry RBAC: User access at production project scope
./wineshoppos_v2_master_executor.sh:3400:2. evaluations
./wineshoppos_v2_master_executor.sh:3661:    'wineshoppos-ai|foundry|gpt-5-mini|Owner-Agent|agent_reference|applicationinsights|APPINSIGHTS|request_id|trace|evaluation|groundedness' \
./wineshoppos_v2_master_executor.sh:3670:  echo "- trace request → Function → Foundry → tools/Supabase → answer"
./wineshoppos_v2_master_executor.sh:3671:  echo "- add golden evaluations"
./wineshoppos_v2_master_executor.sh:3673:  echo "- monitor latency/errors/tokens/evaluation trend"
./wineshoppos_v2_master_executor.sh:3771:- do not create a second AI Function/Foundry project/model/Owner Agent
```

## Required V2 outcome

- reuse the existing production Owner Agent
- trace request → Function → Foundry → tools/Supabase → answer
- add golden evaluations
- fail quality gates on tenant crossover/wrong numeric/tool regression
- monitor latency/errors/tokens/evaluation trend
