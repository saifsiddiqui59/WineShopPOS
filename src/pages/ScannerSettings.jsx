import { useEffect, useState } from "react";
import { useScanner } from "../context/ScannerContext";

export default function ScannerSettings() {
  const { settings, saveSettings, lastScan, successBeep, errorBeep } = useScanner();
  const [draft, setDraft] = useState(settings);
  const [history, setHistory] = useState([]);

  useEffect(() => setDraft(settings), [settings]);
  useEffect(() => { if (lastScan) setHistory((h) => [lastScan, ...h].slice(0, 10)); }, [lastScan]);

  return (
    <div>
      <div className="page-heading"><div><h2>Scanner Test & Settings</h2><p>USB/Bluetooth HID barcode scanner diagnostics</p></div></div>
      <div className="settings-grid">
        <section className="panel">
          <h3>Detection</h3>
          <div className="settings-fields">
            <label><input type="checkbox" checked={draft.enabled} onChange={(e)=>setDraft({...draft,enabled:e.target.checked})}/> Global scanner enabled</label>
            <label>Minimum barcode length<input type="number" min="3" max="40" value={draft.minLength} onChange={(e)=>setDraft({...draft,minLength:Number(e.target.value)})}/></label>
            <label>Maximum average key gap (ms)<input type="number" min="10" max="150" value={draft.maxAverageGapMs} onChange={(e)=>setDraft({...draft,maxAverageGapMs:Number(e.target.value)})}/></label>
            <label>Sequence reset gap (ms)<input type="number" min="80" max="1000" value={draft.resetGapMs} onChange={(e)=>setDraft({...draft,resetGapMs:Number(e.target.value)})}/></label>
          </div>
          <br/><button className="primary-button" onClick={()=>saveSettings(draft)}>Save Scanner Settings</button>
        </section>
        <section className="panel scanner-test-zone">
          <h3>Live Test</h3>
          <p>Click anywhere or type in another field, then scan a barcode. The scanner listener is global.</p>
          {lastScan ? <div className="scanner-last"><strong>{lastScan.barcode}</strong><span>{lastScan.length} chars · avg gap {lastScan.averageGapMs} ms</span></div> : <div className="scanner-last muted">No scan detected yet</div>}
          <div className="button-row"><button className="secondary-button" onClick={successBeep}>Test success beep</button><button className="secondary-button" onClick={errorBeep}>Test error beep</button></div>
        </section>
      </div>
      <section className="panel" style={{marginTop:16}}><h3>Last 10 scans</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Barcode</th><th>Time</th><th>Avg gap</th></tr></thead><tbody>{history.map((s)=><tr key={s.id}><td>{s.barcode}</td><td>{new Date(s.at).toLocaleTimeString()}</td><td>{s.averageGapMs} ms</td></tr>)}</tbody></table></div></section>
    </div>
  );
}
