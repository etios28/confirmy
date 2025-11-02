// src/lib/schedule.ts
export function nextScanDate(plan: string, from = new Date()): Date | null {
  const next = new Date(from);

  switch (plan) {
    case "SCAN_UNIQUE":
      // 👉 Scan unique : pas de re-scan automatique
      return null;

    case "PRO":
      // 🔁 Scan chaque semaine
      next.setDate(next.getDate() + 7);
      break;

    case "BUSINESS":
      // ⚡ Scan chaque jour
      next.setDate(next.getDate() + 1);
      break;

    default:
      // sécurité — si un plan est inconnu
      next.setMonth(next.getMonth() + 1);
  }

  return next;
}
