"use client";

import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";

export default function DashboardPage() {
  const [websites, setWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [rescanning, setRescanning] = useState<string | null>(null);

  useEffect(() => { refreshList(); }, []);

  async function refreshList() {
    try {
      const res = await fetch("/api/websites");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setWebsites(data.websites || []);
    } catch { toast.error("Erreur de chargement"); }
    finally { setLoading(false); }
  }

  async function handleAddWebsite() {
    if (!newUrl.trim()) return toast.error("Merci d'entrer une URL valide.");
    setScanning(true);
    await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: newUrl.trim() }) });
    setNewUrl(""); await refreshList(); setScanning(false);
    toast.success("✅ Audit terminé !");
  }

  async function handleRescan(url: string) {
    setRescanning(url);
    await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
    await refreshList(); setRescanning(null);
    toast.success("🔁 Re-scan terminé !");
  }

async function handleDownloadPDF(site: any) {
  const res = await fetch(`/api/pdf-report?id=${site.id}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `conformy_rapport.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

  const planBadge = (plan: string) => {
    const s: Record<string, [string, string]> = {
      PRO:         ["rgba(99,102,241,0.2)",  "#a5b4fc"],
      BUSINESS:    ["rgba(234,179,8,0.15)",  "#fde047"],
      SCAN_UNIQUE: ["rgba(124,58,237,0.15)", "#c4b5fd"],
    };
    const [bg, color] = s[plan] || ["rgba(255,255,255,0.07)", "rgba(255,255,255,0.35)"];
    const labels: Record<string, string> = { PRO: "Pro", BUSINESS: "Business", SCAN_UNIQUE: "Starter" };
    return <span style={{ background: bg, color, fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "100px" }}>{labels[plan] || "–"}</span>;
  };

  const statusBadge = (status: string) => status === "compliant"
    ? <span style={{ color: "#4ade80", fontWeight: 600, fontSize: "13px" }}>✓ Conforme</span>
    : <span style={{ color: "#f87171", fontWeight: 600, fontSize: "13px" }}>✗ Non conforme</span>;

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#06060a", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>
      Chargement…
    </div>
  );

  const compliant = websites.filter(s => s.status === "compliant").length;
  const nonCompliant = websites.filter(s => s.status === "non_compliant").length;

  return (
    <>
      <style>{`
        .dash-row { transition: background 0.15s; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .dash-row:hover { background: rgba(124,58,237,0.07) !important; }
        .site-card { background: linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 18px; cursor: pointer; transition: border-color 0.2s; }
        .site-card:active { border-color: rgba(124,58,237,0.35); }
        .act-btn { border: none; cursor: pointer; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; padding:7px 14px; border-radius:8px; transition:opacity 0.2s,transform 0.15s; }
        .act-btn:hover:not(:disabled) { opacity:0.8; transform:translateY(-1px); }
        .act-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .url-inp { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:12px 16px; color:#f5f4f0; font-size:14px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; width:100%; box-sizing:border-box; }
        .url-inp:focus { border-color:rgba(124,58,237,0.5); }
        .url-inp::placeholder { color:rgba(255,255,255,0.25); }
        @media (min-width:768px) { .m-cards{display:none!important} .d-table{display:block!important} .sum-grid{grid-template-columns:1fr 1fr!important} }
        @media (max-width:767px)  { .m-cards{display:block!important} .d-table{display:none!important} .sum-grid{grid-template-columns:1fr!important} .dash-pad{padding:20px 16px 60px!important} .stat-mini{grid-template-columns:1fr 1fr!important} }
      `}</style>

      <div style={{ minHeight:"100vh", backgroundColor:"#06060a", color:"#f5f4f0", fontFamily:"'DM Sans',sans-serif" }}>
        <Toaster position="bottom-right" toastOptions={{ style:{background:"#1a1a2e",color:"#f5f4f0",border:"1px solid rgba(255,255,255,0.1)"} }} />

        <div className="dash-pad" style={{ maxWidth:"1200px", margin:"0 auto", padding:"32px 32px 80px" }}>

          {/* Header */}
          <div style={{ marginBottom:"28px" }}>
            <p style={{ fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(124,58,237,0.7)", fontWeight:600, marginBottom:"8px" }}>Tableau de bord</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(22px,3vw,34px)", fontWeight:700, letterSpacing:"-0.03em", color:"#f5f4f0", marginBottom:"4px" }}>Vos sites surveillés</h1>
            <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.3)" }}>
              {websites.length === 0 ? "Aucun site analysé pour l'instant." : `${websites.length} site${websites.length>1?"s":""} · ${compliant} conforme${compliant>1?"s":""} · ${nonCompliant} non conforme${nonCompliant>1?"s":""}`}
            </p>
          </div>

          {/* Ajouter un site */}
          <div style={{ display:"flex", gap:"12px", marginBottom:"28px", flexWrap:"wrap" }}>
            <input type="url" placeholder="https://votre-site.com" value={newUrl}
              onChange={e => setNewUrl(e.target.value)} onKeyDown={e => e.key==="Enter" && handleAddWebsite()}
              className="url-inp" style={{ flex:"1 1 220px" }} />
            <button onClick={handleAddWebsite} disabled={scanning} style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", border:"none", cursor:"pointer", padding:"12px 24px", borderRadius:"10px", fontSize:"14px", fontWeight:600, fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", opacity:scanning?0.6:1, boxShadow:"0 0 24px rgba(124,58,237,0.3)" }}>
              {scanning ? "⏳ Analyse…" : "Lancer l'audit"}
            </button>
          </div>

          {/* Résumé */}
          {websites.length > 0 && (
            <div className="sum-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"28px" }}>
              <div className="stat-mini" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                {[
                  { label:"Total", value:websites.length, color:"#f5f4f0" },
                  { label:"Conformes", value:compliant, color:"#4ade80" },
                  { label:"Non conformes", value:nonCompliant, color:"#f87171" },
                  { label:"Conformité", value: websites.length ? `${Math.round((compliant/websites.length)*100)}%` : "–", color:"#c4b5fd" },
                ].map(s => (
                  <div key={s.label} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"12px", padding:"16px" }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"26px", fontWeight:700, color:s.color, marginBottom:"4px" }}>{s.value}</div>
                    <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"12px", padding:"16px", minHeight:"180px" }}>
                <ResponsiveContainer width="100%" height={165}>
                  <PieChart>
                    <Pie data={[{name:"Conformes",value:compliant},{name:"Non conformes",value:nonCompliant}]} cx="50%" cy="50%" outerRadius={65} dataKey="value" strokeWidth={0}>
                      <Cell fill="#4ade80"/><Cell fill="#f87171"/>
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor:"#1a1a2e", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"#f5f4f0", fontSize:"12px" }} />
                    <Legend wrapperStyle={{ fontSize:"12px", color:"rgba(255,255,255,0.4)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Desktop table */}
          <div className="d-table" style={{ display:"none", overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                  {["URL","Statut","Note","Dernier scan","Plan","Actions"].map(h => (
                    <th key={h} style={{ padding:"10px 14px", textAlign:"left", color:"rgba(255,255,255,0.28)", fontWeight:600, fontSize:"11px", letterSpacing:"0.08em", textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {websites.map(site => {
                  const rp = site.report ? JSON.parse(site.report) : {};
                  return (
                    <tr key={site.id} className="dash-row" onClick={() => window.location.href=`/dashboard/${site.id}`}>
                      <td style={{ padding:"14px", maxWidth:"200px" }}><span style={{ color:"#818cf8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{site.url}</span></td>
                      <td style={{ padding:"14px" }}>{statusBadge(site.status)}</td>
                      <td style={{ padding:"14px" }}>
                        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"17px", fontWeight:700, color:"#c4b5fd" }}>{rp.note_conformite ?? "–"}</span>
                        <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.25)" }}>/100</span>
                      </td>
                      <td style={{ padding:"14px", color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap" }}>{new Date(site.updatedAt).toLocaleDateString("fr-FR")}</td>
                      <td style={{ padding:"14px" }}>{planBadge(site.plan)}</td>
                      <td style={{ padding:"14px" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display:"flex", gap:"8px" }}>
                          <button onClick={() => handleRescan(site.url)} disabled={rescanning===site.url} className="act-btn" style={{ background:"rgba(124,58,237,0.18)", color:"#c4b5fd" }}>
                            {rescanning===site.url ? "⏳" : "↺ Re-scan"}
                          </button>
                          <button onClick={() => handleDownloadPDF(site)} className="act-btn" style={{ background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.55)" }}>
                            ↓ PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {websites.length === 0 && (
              <div style={{ textAlign:"center", padding:"60px 0", color:"rgba(255,255,255,0.2)", fontSize:"14px" }}>
                Aucun site audité.<br/><span style={{ fontSize:"12px" }}>Entrez une URL ci-dessus pour commencer.</span>
              </div>
            )}
          </div>

          {/* Mobile cards */}
          <div className="m-cards" style={{ display:"none" }}>
            {websites.length === 0 && (
              <div style={{ textAlign:"center", padding:"60px 0", color:"rgba(255,255,255,0.2)", fontSize:"14px" }}>
                Aucun site audité.<br/><span style={{ fontSize:"12px" }}>Entrez une URL ci-dessus pour commencer.</span>
              </div>
            )}
            {websites.map(site => {
              const rp = site.report ? JSON.parse(site.report) : {};
              return (
                <div key={site.id} className="site-card" onClick={() => window.location.href=`/dashboard/${site.id}`} style={{ marginBottom:"12px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"8px", marginBottom:"10px" }}>
                    <span style={{ color:"#818cf8", fontSize:"13px", fontWeight:500, wordBreak:"break-all", flex:1 }}>{site.url}</span>
                    {planBadge(site.plan)}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"8px" }}>
                    {statusBadge(site.status)}
                    <span>
                      <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", fontWeight:700, color:"#c4b5fd" }}>{rp.note_conformite ?? "–"}</span>
                      <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.25)" }}>/100</span>
                    </span>
                  </div>
                  {rp.commentaires && <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.32)", lineHeight:1.6, marginBottom:"12px", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" } as any}>{rp.commentaires}</p>}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:"10px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.22)" }}>{new Date(site.updatedAt).toLocaleDateString("fr-FR")}</span>
                    <div style={{ display:"flex", gap:"8px" }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleRescan(site.url)} disabled={rescanning===site.url} className="act-btn" style={{ background:"rgba(124,58,237,0.18)", color:"#c4b5fd" }}>
                        {rescanning===site.url ? "⏳" : "↺ Re-scan"}
                      </button>
                      <button onClick={() => handleDownloadPDF(site)} className="act-btn" style={{ background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.55)" }}>
                        ↓ PDF
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </>
  );
}