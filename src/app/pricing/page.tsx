"use client";

import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";

export default function PricingPage() {
  const [scanUrl, setScanUrl] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  async function handleUniqueScan() {
    if (!scanUrl.trim()) {
      toast.error("Merci d'entrer une URL valide (ex: https://exemple.com)");
      return;
    }

    setLoading(true);
    setScanResult(null);

    try {
      const res = await fetch("/api/scan-once", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scanUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur lors du scan.");

      setScanResult(data);
      toast.success("✅ Scan terminé !");
    } catch (err: any) {
      console.error(err);
      toast.error("❌ Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout(plan: string) {
    setCheckoutLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur paiement.");

      window.location.href = data.url;
    } catch (err: any) {
      toast.error("❌ Erreur : " + err.message);
    } finally {
      setCheckoutLoading(null);
    }
  }

  return (
    <main className="p-10 min-h-screen bg-black text-gray-200">
      <Toaster position="bottom-right" />
      <h1 className="text-4xl font-bold mb-10 text-center text-white">
        Choisis ton plan 🚀
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
        {/* Scan unique */}
        <div className="border border-gray-700 p-6 rounded-lg shadow bg-[#121212]">
          <h2 className="text-xl font-semibold mb-2 text-white">Starter</h2>
          <p className="text-3xl font-bold mb-2 text-purple-400">4,99 €</p>
          <p className="text-gray-400 mb-4">/ scan unique</p>
          <ul className="mb-4 text-gray-400 text-sm">
            <li>✅ 1 site</li>
            <li>✅ 1 scan complet</li>
            <li>⚠️ Pas de sauvegarde ni d'historique</li>
            <li>📄 Rapport consultable immédiatement</li>
          </ul>
          <input
            type="text"
            placeholder="https://exemple.com"
            value={scanUrl}
            onChange={(e) => setScanUrl(e.target.value)}
            className="w-full mb-3 bg-[#1a1a1a] border border-gray-700 rounded px-4 py-2 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-600"
          />
          <button
            onClick={() => handleCheckout("SCAN_UNIQUE")}
            disabled={checkoutLoading === "SCAN_UNIQUE"}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded transition"
          >
            {checkoutLoading === "SCAN_UNIQUE" ? "Redirection..." : "🚀 Payer 4,99 € et scanner"}
          </button>
        </div>

        {/* Pro */}
        <div className="border border-gray-700 p-6 rounded-lg shadow bg-[#121212]">
          <h2 className="text-xl font-semibold mb-2 text-white">Pro</h2>
          <p className="text-3xl font-bold mb-2 text-purple-400">19 €</p>
          <p className="text-gray-400 mb-4">/ mois</p>
          <ul className="mb-4 text-gray-400 text-sm">
            <li>✅ Jusqu'à 10 sites</li>
            <li>✅ Scans automatiques hebdo</li>
            <li>✅ Alertes email en cas de non-conformité</li>
            <li>✅ Historique complet des rapports</li>
          </ul>
          <button
            onClick={() => handleCheckout("PRO")}
            disabled={checkoutLoading === "PRO"}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded transition"
          >
            {checkoutLoading === "PRO" ? "Redirection..." : "S'abonner Pro"}
          </button>
        </div>

        {/* Business */}
        <div className="border border-gray-700 p-6 rounded-lg shadow bg-[#121212]">
          <h2 className="text-xl font-semibold mb-2 text-white">Business</h2>
          <p className="text-3xl font-bold mb-2 text-purple-400">49 €</p>
          <p className="text-gray-400 mb-4">/ mois</p>
          <ul className="mb-4 text-gray-400 text-sm">
            <li>✅ Scans illimités</li>
            <li>✅ Scans quotidiens automatiques</li>
            <li>✅ Alertes email + Slack</li>
            <li>✅ Rapports PDF détaillés</li>
            <li>✅ Support prioritaire</li>
            <li>✅ Intégration IA avancée</li>
          </ul>
          <button
            onClick={() => handleCheckout("BUSINESS")}
            disabled={checkoutLoading === "BUSINESS"}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded transition"
          >
            {checkoutLoading === "BUSINESS" ? "Redirection..." : "S'abonner Business"}
          </button>
        </div>
      </div>

      {/* Résultat du scan unique */}
      {scanResult && (
        <div className="max-w-2xl mx-auto bg-[#121212] border border-gray-700 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">
            🔍 Résultat du scan
          </h2>
          <p className="text-gray-300 mb-2">
            <strong>URL :</strong> {scanResult.url}
          </p>
          <p className="mb-2">
            <strong>Statut :</strong>{" "}
            {scanResult.status === "compliant" ? (
              <span className="text-green-400">✅ Conforme</span>
            ) : (
              <span className="text-red-400">❌ Non conforme</span>
            )}
          </p>
          <p className="mb-2">
            <strong>Note :</strong>{" "}
            <span className="text-purple-400 text-lg font-semibold">
              {scanResult.report?.note_conformite ?? "-"} / 100
            </span>
          </p>
          <p className="text-gray-400 mb-3">{scanResult.report?.commentaires}</p>
          {scanResult.report?.foundKeywords?.length > 0 && (
            <>
              <p className="font-semibold text-white mb-2">Mots-clés trouvés :</p>
              <ul className="list-disc list-inside text-gray-400">
                {scanResult.report.foundKeywords.map((kw: string, i: number) => (
                  <li key={i}>{kw}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </main>
  );
}