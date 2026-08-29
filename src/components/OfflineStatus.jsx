import { useEffect, useState } from "react";
import { offlineQueueCounts } from "../lib/offlineQueue";

export default function OfflineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [counts, setCounts] = useState({ pending: 0, conflict: 0 });

  useEffect(() => {
    const refresh = () => {
      setOnline(navigator.onLine);
      offlineQueueCounts().then(setCounts).catch(() => {});
    };
    refresh();
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    const timer = setInterval(refresh, 5000);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
    };
  }, []);

  return (
    <div className={`offline-status ${online ? "online" : "offline"}`}>
      <span>{online ? "ONLINE" : "OFFLINE"}</span>
      {(counts.pending > 0 || counts.conflict > 0) && (
        <small>{counts.pending} pending · {counts.conflict} conflict</small>
      )}
    </div>
  );
}
