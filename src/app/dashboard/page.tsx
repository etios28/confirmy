"use client";

import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";

export default function DashboardPage() {
  const [websites, setWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    refreshList();
  }, []);

  async function refreshList() {
    try {
      const res = await fetch("/api/websites");
      if (!res.ok) throw new Error("Erreur HTTP: " + res.status);
      const data = await res.json();
      setWebsites(data.websites || []);
    } catch (err) {
      console.error(err);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddWebsite() {
    if (!newUrl.trim()) return toast.error("Merci d’entrer une URL valide.");
    setLoading(true);
    await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: newUrl.trim() }),
    });
    setNewUrl("");
    await refreshList();
    toast.success("✅ Scan terminé !");
  }

  async function handleRescan(url: string) {
    setLoading(true);
    await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    await refreshList();
    toast.success("🔁 Re-scan terminé !");
  }

  function handleDownloadPDF(site: any) {
    const doc = new jsPDF();
    const report = site.report ? JSON.parse(site.report) : {};

    doc.setFontSize(18);
    doc.text("Rapport de conformité - Conformy", 20, 20);
    doc.setFontSize(12);
    doc.text(`URL : ${site.url}`, 20, 35);
    doc.text(`Statut : ${site.status}`, 20, 45);
    doc.text(`Note : ${report.note_conformite ?? "-"}`, 20, 55);
    doc.text(`Commentaires : ${report.commentaires ?? "-"}`, 20, 70);
    doc.save(`rapport_${site.url.replace(/https?:\/\//, "").replace(/\W+/g, "_")}.pdf`);
  }

  if (loading) return <p className="p-8 text-gray-400">Chargement...</p>;

  return (
    <div className="p-8 min-h-screen bg-black text-gray-200 select-none">
      <Toaster position="bottom-right" />
      <h1 className="text-3xl font-bold mb-6 text-white">
        📊 Tableau de bord Conformy
      </h1>

      {/* Ajouter un site */}
      <div className="flex items-center gap-3 mb-8">
        <input
          type="text"
          placeholder="https://exemple.com"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-600"
        />
        <button
          onClick={handleAddWebsite}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-lg"
        >
          🚀 Analyser
        </button>
      </div>

      {/* Résumé global */}
      {websites.length > 0 && (
        <div className="bg-[#121212] border border-gray-700 rounded-xl p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">Résumé global</h2>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-gray-300 text-lg">
                🌍 {websites.length} sites scannés
              </p>
              <p className="text-green-400">
                ✅ {websites.filter((s) => s.status === "compliant").length} conformes
              </p>
              <p className="text-red-400">
                ❌ {websites.filter((s) => s.status === "non_compliant").length} non conformes
              </p>
            </div>

            <div className="w-full sm:w-1/3 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Conformes",
                        value: websites.filter((s) => s.status === "compliant").length,
                      },
                      {
                        name: "Non conformes",
                        value: websites.filter((s) => s.status === "non_compliant").length,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tableau */}
      <table className="min-w-full border border-gray-700 bg-[#121212] rounded-lg shadow-lg">
        <thead className="bg-gray-800 text-gray-200">
          <tr>
            <th className="p-3 text-left">URL</th>
            <th className="p-3 text-left">Statut</th>
            <th className="p-3 text-left">Note</th>
            <th className="p-3 text-left">Commentaires</th>
            <th className="p-3 text-left">Dernier scan</th>
            <th className="p-3 text-left">Plan</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {websites.map((site) => {
            const report = site.report ? JSON.parse(site.report) : {};
            return (
              <tr
                key={site.id}
                onClick={() => (window.location.href = `/dashboard/${site.id}`)}
                className="border-t border-gray-700 hover:bg-purple-900/30 active:bg-purple-800/30 transition cursor-pointer"
                style={{ userSelect: "none" }}
              >
                <td className="p-3 text-blue-400">{site.url}</td>
                <td className="p-3">
                  {site.status === "compliant" ? (
                    <span className="text-green-400 font-semibold">✅ Conforme</span>
                  ) : (
                    <span className="text-red-400 font-semibold">❌ Non conforme</span>
                  )}
                </td>
                <td className="p-3 text-gray-300">
                  {report.note_conformite ?? "-"}
                </td>
                <td className="p-3 text-sm text-gray-400">
                  {report.commentaires ?? "-"}
                </td>
                <td className="p-3 text-sm text-gray-400">
                  {new Date(site.updatedAt).toLocaleDateString("fr-FR")}
                </td>
                
                <td className="p-3 text-sm">
                  {site.plan === "PRO" ? (
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      PRO
                    </span>
                  ) : site.plan === "BUSINESS" ? (
                    <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-semibold">
                      BUSINESS
                    </span>
                  ) : site.plan === "SCAN_UNIQUE" ? (
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Scan unique
                    </span>
                  ) : (
                    <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-semibold">
                      -
                    </span>
                  )}
                </td>

                <td
                  className="p-3 flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleRescan(site.url)}
                    className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                  >
                    🔁 Re-scan
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(site)}
                    className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
                  >
                    📄 PDF
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
