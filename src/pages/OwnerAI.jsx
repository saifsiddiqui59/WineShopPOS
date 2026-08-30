import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Bot, ExternalLink, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { askWineShopPOS, isAIConfigured } from "../lib/aiClient";
import PageHeader from "../components/ui/PageHeader";

const SUGGESTIONS = [
  "What were today's sales?",
  "What should I reorder today?",
  "Which products may run out this week?",
  "Why did profit fall yesterday?",
  "Which supplier increased prices recently?",
  "Are there unusual shift differences requiring review?",
];

const SOURCE_LABELS = {
  "/pos/sales": "View Sales",
  "/owner/profit": "View Profit Intelligence",
  "/inventory/intelligence": "View Inventory Intelligence",
  "/inventory": "View Inventory",
  "/purchasing/intelligence": "View Purchase Intelligence",
  "/operations/shifts": "View Shifts",
  "/owner/exceptions": "View Loss & Exceptions",
  "/operations/expenses": "View Expenses",
};

export default function OwnerAI() {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [memberships, setMemberships] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState(profile?.shop_id || "");
  const [scope, setScope] = useState("SHOP");
  const [message, setMessage] = useState("");
  const [turns, setTurns] = useState([]);
  const [lastQuestion, setLastQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingShops, setLoadingShops] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingShops(true);
      const { data, error: shopError } = await supabase.rpc("my_shop_memberships");
      if (!active) return;
      if (shopError) {
        setError("Unable to load authorized shop context.");
        setMemberships([]);
      } else {
        const adminShops = (data || []).filter((row) => row.role === "ADMIN");
        setMemberships(adminShops);
        const preferred = adminShops.find((x) => x.shop_id === profile?.shop_id)?.shop_id || adminShops[0]?.shop_id || "";
        setSelectedShopId(preferred);
      }
      setLoadingShops(false);
    })();
    return () => { active = false; };
  }, [profile?.shop_id]);

  const selectedShop = useMemo(
    () => memberships.find((x) => x.shop_id === selectedShopId) || null,
    [memberships, selectedShopId],
  );

  function changeShop(value) {
    setSelectedShopId(value);
    setScope("SHOP");
    setTurns([]);
    setError("");
  }

  function changeScope(value) {
    setScope(value);
    setTurns([]);
    setError("");
  }

  async function ask(text=message) {
    const question = String(text || "").trim();
    if (!question || !selectedShopId || loading) return;
    if (!navigator.onLine) {
      setError("AI requires an internet connection. POS offline mode is unaffected.");
      return;
    }

    setLoading(true);
    setError("");
    setLastQuestion(question);
    setMessage("");

    const history = turns.slice(-6).map((turn) => ({
      role: turn.role,
      content: turn.content,
    }));

    setTurns((current) => [...current, { role: "user", content: question }]);

    try {
      const result = await askWineShopPOS({
        token: session?.access_token,
        message: question,
        selectedShopId,
        scope,
        history,
      });
      setTurns((current) => [...current, {
        role: "assistant",
        content: result.answer,
        sources: result.sources || [],
        tools: result.tools_called || [],
        requestId: result.request_id,
        context: result.context,
      }]);
    } catch (e) {
      setError(e?.message || "AI insights are temporarily unavailable. POS and business operations are unaffected.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  return (
    <div className="ai-owner-page">
      <PageHeader
        title="Ask WineShopPOS"
        subtitle="Grounded, read-only business intelligence. Your business engine calculates; AI explains."
        tier="PRO"
        actions={<span className="ai-readonly-pill"><ShieldCheck size={15}/> Read only</span>}
      />

      <div className="ai-owner-grid">
        <aside className="ai-context-card">
          <div className="ai-context-title"><Sparkles size={17}/> Trusted business scope</div>
          <p className="muted">The backend validates every request. The AI model cannot select another tenant or arbitrary shop.</p>

          <label className="field-label" htmlFor="ai-shop">Shop context</label>
          <select
            id="ai-shop"
            value={selectedShopId}
            onChange={(e) => changeShop(e.target.value)}
            disabled={loadingShops || loading}
          >
            {memberships.map((shop) => <option key={shop.shop_id} value={shop.shop_id}>{shop.shop_name}</option>)}
          </select>

          {memberships.length > 1 ? (
            <>
              <label className="field-label" htmlFor="ai-scope">Analysis scope</label>
              <select id="ai-scope" value={scope} onChange={(e) => changeScope(e.target.value)} disabled={loading}>
                <option value="SHOP">{selectedShop?.shop_name || "Selected shop"} only</option>
                <option value="ALL">All ADMIN shops in this organization</option>
              </select>
            </>
          ) : null}

          <div className="ai-safety-list">
            <span>✓ ADMIN / Owner Center only</span>
            <span>✓ Verified Supabase data</span>
            <span>✓ No stock or financial writes</span>
            <span>✓ No unrestricted SQL access</span>
          </div>
        </aside>

        <section className="ai-chat-card">
          {!isAIConfigured() ? (
            <div className="ai-inline-warning">
              AI backend endpoint is not configured in this build. Core POS remains available.
            </div>
          ) : null}

          <div className="ai-chat-scroll" aria-live="polite">
            {turns.length === 0 ? (
              <div className="ai-empty-state">
                <div className="ai-bot-mark"><Bot size={26}/></div>
                <h3>What do you want to understand?</h3>
                <p>Ask about verified sales, stock, profit, expenses, supplier prices, reorder needs or operational exceptions.</p>
                <div className="ai-suggestion-grid">
                  {SUGGESTIONS.map((q) => (
                    <button key={q} type="button" className="ai-suggestion" onClick={() => ask(q)} disabled={loading || !selectedShopId}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="ai-turn-list">
                {turns.map((turn, index) => (
                  <div key={`${turn.role}-${index}`} className={`ai-turn ai-${turn.role}`}>
                    <div className="ai-turn-role">{turn.role === "assistant" ? "WineShopPOS" : "You"}</div>
                    <div className="ai-turn-content">{turn.content}</div>
                    {turn.role === "assistant" && turn.sources?.length ? (
                      <div className="ai-source-actions">
                        {[...new Set(turn.sources)].map((path) => (
                          <button key={path} type="button" onClick={() => navigate(path)}>
                            {SOURCE_LABELS[path] || "Open source screen"} <ExternalLink size={13}/>
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {turn.role === "assistant" && turn.tools?.length ? (
                      <div className="ai-grounding-note">Verified with: {[...new Set(turn.tools)].join(", ")}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            {loading ? (
              <div className="ai-turn ai-assistant ai-thinking">
                <div className="ai-turn-role">WineShopPOS</div>
                <div className="ai-thinking-dots"><span/><span/><span/></div>
                <span>Checking verified business data…</span>
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="ai-error-state">
              <span>{error}</span>
              {lastQuestion ? (
                <button type="button" onClick={() => ask(lastQuestion)} disabled={loading}>
                  <RefreshCw size={14}/> Retry
                </button>
              ) : null}
            </div>
          ) : null}

          <form className="ai-composer" onSubmit={(e) => { e.preventDefault(); ask(); }}>
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about sales, stock, profit, supplier prices…"
              rows={2}
              maxLength={2000}
              disabled={loading || !selectedShopId}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask();
                }
              }}
            />
            <button
              className="btn btn-primary ai-send-button"
              type="submit"
              aria-label="Send question"
              disabled={loading || !message.trim() || !selectedShopId || !isAIConfigured()}
            >
              <ArrowUp size={18}/>
            </button>
          </form>
          <div className="ai-disclaimer">
            AI can make mistakes in explanations. Business numbers come only from approved WineShopPOS tools.
          </div>
        </section>
      </div>
    </div>
  );
}
