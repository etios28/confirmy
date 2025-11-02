import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.FROM_EMAIL!;

export async function notifyNonCompliant(to: string, siteUrl: string) {
  if (!process.env.RESEND_API_KEY || !FROM || !to) return;
  const subject = `🔴 Conformy: ${siteUrl} est passé en non conforme`;
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Changement de statut détecté</h2>
      <p>Le site <strong>${siteUrl}</strong> est passé à <strong>❌ non conforme</strong>.</p>
      <p>Pense à vérifier les mentions légales, confidentialité et cookies.</p>
      <p>— Conformy</p>
    </div>
  `;
  await resend.emails.send({ from: FROM, to, subject, html });
}
