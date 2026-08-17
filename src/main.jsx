import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
    const [telemetryData, setTelemetryData] = useState([]);
    const [testResults, setTestResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updated, setUpdated] = useState("");
    const [activeTab, setActiveTab] = useState("test-results");

    async function load() {
        try {
            setLoading(true);
            setError("");
            
            // Fetch telemetry data
            const telPromise = (async () => {
                let r = await fetch("/api/hardware");
                const contentType = r.headers.get("content-type") || "";
                if (!r.ok || !contentType.includes("application/json")) {
                    r = await fetch("https://hardware-api-calls.onrender.com/api/gethardware-data");
                }
                if (!r.ok) throw new Error("HTTP " + r.status);
                const x = await r.json();
                return Array.isArray(x) ? x : x.data || x.hardwareData || x.hardware || [x];
            })();

            // Fetch test results data
            const testPromise = (async () => {
                let r = await fetch("/api/hardware-test-result");
                const contentType = r.headers.get("content-type") || "";
                if (!r.ok || !contentType.includes("application/json")) {
                    r = await fetch("https://hardware-api-calls.onrender.com/api/hardware-test-result");
                }
                if (!r.ok) throw new Error("HTTP " + r.status);
                const x = await r.json();
                return Array.isArray(x) ? x : x.data || x.hardwareData || x.hardware || [x];
            })();

            const [telData, tResults] = await Promise.all([
                telPromise.catch(e => { console.error("Telemetry fetch failed:", e); return []; }),
                testPromise.catch(e => { console.error("Test results fetch failed:", e); return []; })
            ]);

            setTelemetryData(telData);
            setTestResults(tResults);
            setUpdated(new Date().toLocaleTimeString());
        } catch (e) {
            console.error(e);
            setError("Unable to load hardware data.");
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
                    <h1 style={{ margin: "4px 0 0", fontSize: "28px" }}>Hardware Control Center</h1>
                </div>
                <button onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</button>
            </header>
            {error && <div className="error">{error}</div>}
            
            <div className="stats">
                <div>
                    <span>Telemetry Records</span>
                    <b>{telemetryData.length}</b>
                </div>
                <div>
                    <span>Last Updated</span>
                    <b>{updated || "—"}</b>
                </div>
            </div>

            <div className="tabs">
                <button className={`tab-btn ${activeTab === 'test-results' ? 'active' : ''}`} onClick={() => setActiveTab('test-results')}>
                    Test Results
                </button>
                <button className={`tab-btn ${activeTab === 'telemetry' ? 'active' : ''}`} onClick={() => setActiveTab('telemetry')}>
                    Live Telemetry
                </button>
            </div>

            {activeTab === 'telemetry' ? (
                <section>
                    <div className="title">
                        <h2>Live Telemetry</h2>
                        <em>LIVE</em>
                    </div>
                    <div className="table">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Device</th>
                                    <th>Temperature</th>
                                    <th>Humidity</th>
                                    <th>Received At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {telemetryData.length ? telemetryData.map((x, i) => (
                                    <tr key={x.id || i}>
                                        <td>{i + 1}</td>
                                        <td><strong>{x.device ?? x.deviceId ?? "—"}</strong></td>
                                        <td>{x.temp ?? x.temperature ?? "—"} °C</td>
                                        <td>{x.humidity ?? "—"} %</td>
                                        <td>{x.receivedAt ? new Date(x.receivedAt).toLocaleString() : "—"}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="empty">{loading ? "Loading..." : "No telemetry data found."}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : (
                <section>
                    <div className="title">
                        <h2>Hardware Test Results</h2>
                        <em style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>TESTS</em>
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
                                {testResults.length ? testResults.map((x, i) => (
                                    <tr key={x.id || i}>
                                        <td>{i + 1}</td>
                                        <td><strong>{x.deviceId ?? x.device ?? "—"}</strong></td>
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
            )}
        </div>
    );
}

createRoot(document.getElementById("root")).render(<App />);