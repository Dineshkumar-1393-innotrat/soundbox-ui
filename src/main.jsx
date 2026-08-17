import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
    const [data, setData] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState(""), [updated, setUpdated] = useState("");
    async function load() {
        try {
            setLoading(true); setError("");
            let r = await fetch("/api/hardware");
            const contentType = r.headers.get("content-type") || "";
            if (!r.ok || !contentType.includes("application/json")) {
                r = await fetch("https://hardware-api-calls.onrender.com/api/gethardware-data");
            }
            if (!r.ok) throw new Error("HTTP " + r.status);
            const x = await r.json();
            setData(Array.isArray(x) ? x : x.data || x.hardwareData || x.hardware || [x]);
            setUpdated(new Date().toLocaleTimeString());
        } catch (e) { console.error(e); setError("Unable to load hardware data."); }
        finally { setLoading(false); }
    }
    useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t) }, []);
    return <div className="app">
        <header><div><small>Example PROJECT</small><h1>Hardware Dashboard</h1><p>Live ESP32 temperature and humidity data</p></div><button onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</button></header>
        {error && <div className="error">{error}</div>}
        <div className="stats"><div><span>Records</span><b>{data.length}</b></div><div><span>Last updated</span><b>{updated || "—"}</b></div></div>
        <section><div className="title"><h2>Hardware Data</h2><em>LIVE</em></div>
            <div className="table"><table><thead><tr><th>#</th><th>Device</th><th>Temperature</th><th>Humidity</th><th>Received At</th></tr></thead>
                <tbody>{data.length ? data.map((x, i) => <tr key={x.id || i}><td>{i + 1}</td><td><strong>{x.device ?? x.deviceId ?? "—"}</strong></td><td>{x.temp ?? x.temperature ?? "—"} °C</td><td>{x.humidity ?? "—"} %</td><td>{x.receivedAt ? new Date(x.receivedAt).toLocaleString() : "—"}</td></tr>) : <tr><td colSpan="5" className="empty">{loading ? "Loading..." : "No hardware data found."}</td></tr>}</tbody>
            </table></div></section>
    </div>
}
createRoot(document.getElementById("root")).render(<App />);