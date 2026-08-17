import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updated, setUpdated] = useState("");

    async function load() {
        try {
            setLoading(true);
            setError("");
            let r = await fetch("/api/hardware-test-result");
            const contentType = r.headers.get("content-type") || "";
            if (!r.ok || !contentType.includes("application/json")) {
                const fallbackUrl = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
                    ? "http://localhost:5173/api/hardware-test-result"
                    : "https://hardware-api-calls.onrender.com/api/hardware-test-result";
                r = await fetch(fallbackUrl);
            }
            if (!r.ok) throw new Error("HTTP " + r.status);
            const x = await r.json();
            setData(Array.isArray(x) ? x : x.data || x.hardwareData || x.hardware || [x]);
            setUpdated(new Date().toLocaleTimeString());
        } catch (e) {
            console.error(e);
            setError("Unable to load hardware test results.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        const t = setInterval(load, 5000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="app">
            <header>
                <div>
                    <small>Example PROJECT</small>
                    <h1 style={{ margin: "4px 0 0", fontSize: "28px" }}>Hardware Test Results</h1>
                </div>
                <button onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</button>
            </header>
            {error && <div className="error">{error}</div>}

            <div className="stats">
                <div>
                    <span>Total Tests</span>
                    <b>{data.length}</b>
                </div>
                <div>
                    <span>Last Updated</span>
                    <b>{updated || "—"}</b>
                </div>
            </div>

            <section>
                <div className="title">
                    <h2>Test Results</h2>
                    <em>LIVE</em>
                </div>
                <div className="table">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ID</th>
                                <th>Test Name</th>
                                <th>Result</th>
                                <th>Received At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length ? data.map((x, i) => (
                                <tr key={x.id || i}>
                                    <td>{i + 1}</td>
                                    <td><strong>{x.deviceId ?? "—"}</strong></td>
                                    <td>{x.testName ?? "—"}</td>
                                    <td>
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: x.result === 'pass' ? '#15803d' : x.result?.startsWith('0x') || x.result?.includes(' ') ? '#1e293b' : '#b42318',
                                            backgroundColor: x.result === 'pass' ? '#e9f8ef' : x.result?.startsWith('0x') || x.result?.includes(' ') ? '#f1f5f9' : '#fef2f2',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '13px'
                                        }}>
                                            {x.result ?? "—"}
                                        </span>
                                    </td>
                                    <td>{x.receivedAt ? new Date(x.receivedAt).toLocaleString() : "—"}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="empty">{loading ? "Loading..." : "No test results found."}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

createRoot(document.getElementById("root")).render(<App />);