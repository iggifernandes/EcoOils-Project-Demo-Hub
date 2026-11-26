/* Live link between a guard device and the supervisor monitor (sample data only, no personal data).
   Uses the free public relay ntfy.sh: the guard device POSTs tiny events to a private-ish topic,
   the monitor listens on it. Change the room with ?room=name on both devices (stored on the device).
   For a self-hosted relay use ?relay=https://your-server on both. If the relay is unreachable the demo still works locally. */
const Sync = (() => {
  const q = new URLSearchParams(location.search);
  if (q.get("room")) localStorage.setItem("demohub.room", q.get("room").replace(/[^A-Za-z0-9_-]/g, ""));
  if (q.get("relay")) localStorage.setItem("demohub.relay", q.get("relay").replace(/\/$/, ""));
  if (q.get("relay") === "") localStorage.removeItem("demohub.relay");
  const ROOM = localStorage.getItem("demohub.room") || "ecooils-mentari-patrol-demo-7k2q9x";
  const RELAY = localStorage.getItem("demohub.relay") || "https://ntfy.sh";
  const url = RELAY + "/" + ROOM;
  let lastId = "", es = null, retry = 0;

  function publish(ev) {
    try { fetch(url, { method: "POST", body: JSON.stringify(ev), keepalive: true }).catch(() => {}); } catch (e) { /* offline: local demo only */ }
  }
  function listen(onEvent, onStatus) {
    const open = () => {
      onStatus("connecting");
      es = new EventSource(url + "/sse?since=" + (lastId || "10m"));
      es.onopen = () => { retry = 0; onStatus("live"); };
      es.onmessage = m => {
        try { const d = JSON.parse(m.data); if (d.id) lastId = d.id; if (d.event === "message") onEvent(JSON.parse(d.message)); } catch (e) { /* ignore non-demo messages */ }
      };
      es.onerror = () => { es.close(); onStatus("offline"); setTimeout(open, Math.min(15000, 1500 * ++retry)); };
    };
    open();
  }
  return { publish, listen, ROOM, RELAY };
})();
