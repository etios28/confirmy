"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function WebsiteReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/website?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setSite(data.website);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center">
        <p>Chargement du rapport...</p>
      </div>
    );

  if (!site)
    return (
      <div className="min-h-screen bg-black text-gray-300 flex flex-col items-center justify-center">
        <p>Site introuvable.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 bg-purple-600 px-4 py-2 rounded text-white"
        >
          Retour au dashboard
        </button>
      </div>
    );

  const report = site.report ? JSON.parse(site.report) : {};

  return (
    <div className="min-h-screen bg-black text-gray-100 p-10">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 bg-gray-800 px-4 py-2 rounded hover:bg-gray-700"
      >
        ← Retour au dashboard
      </button>

      <h1 className="text-3xl font-bold mb-4 text-purple-400">{site.url}</h1>

      <div className="bg-[#121212] rounded-lg p-6 shadow-lg border border-gray-800">
        <p className="text-lg mb-2">
          <strong>Statut :</strong>{" "}
          {site.status === "compliant" ? (
            <span className="text-green-400">✅ Conforme</span>
          ) : (
            <span className="text-red-400">❌ Non conforme</span>
          )}
        </p>

        <p className="text-lg mb-2">
          <strong>Note de conformité :</strong>{" "}
          <span className="text-purple-400 text-xl font-semibold">
            {report.note_conformite ?? 0}/100
          </span>
        </p>

        <p className="text-lg mb-4">
          <strong>Dernier scan :</strong>{" "}
          {new Date(site.updatedAt).toLocaleString("fr-FR")}
        </p>

        <hr className="border-gray-700 my-4" />

        <h2 className="text-xl font-semibold mb-3 text-white">🧩 Mots-clés trouvés</h2>
        <ul className="list-disc list-inside text-gray-300 mb-6">
          {report.foundKeywords?.length > 0 ? (
            report.foundKeywords.map((k: string, i: number) => (
              <li key={i}>{k}</li>
            ))
          ) : (
            <li className="text-gray-500">Aucun mot-clé trouvé</li>
          )}
        </ul>

        <h2 className="text-xl font-semibold mb-3 text-white">🧠 Analyse IA</h2>
        <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
          {report.commentaires ?? "Aucun commentaire généré pour ce site."}
        </p>
      </div>
    </div>
  );
}
