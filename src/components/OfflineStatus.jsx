import { useEffect, useState } from "react";
import { offlineQueueCounts } from "../lib/offlineQueue";
import { probeBackendConnectivity } from "../lib/connectivity";

export default function OfflineStatus() {
  const [state, setState] = useState("CHECKING");
  const [counts, setCounts] = useState({ pending: 0, conflict: 0 });

  useEffect(() => {
    let alive = true;

    const refresh = async () => {
      const [probe, queueCounts] = await Promise.all([
        probeBackendConnectivity(),
        offlineQueueCounts().catch(() => null),
      ]);

      if (!alive) return;
      setState(probe.reachable ? "ONLINE" : "OFFLINE");
      if (queueCounts) setCounts(queueCounts);
    };

    void refresh();

    // Browser online/offline events are only wake-up hints. The backend probe
    // decides the displayed state.
    const signal = () => void refresh();
    window.addEventListener("online", signal);
    window.addEventListener("offline", signal);
    const timer = setInterval(signal, 15000);

    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener("online", signal);
      window.removeEventListener("offline", signal);
    };
  }, []);

  const offline = state === "OFFLINE";

  return (
    <div className={`offline-status ${offline ? "offline" : "online"}`}>
      <span>{state}</span>
      {(counts.pending > 0 || counts.conflict > 0) && (
        <small>{counts.pending} pending · {counts.conflict} conflict</small>
      )}
    </div>
  );
}
