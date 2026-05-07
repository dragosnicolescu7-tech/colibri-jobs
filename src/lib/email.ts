import nodemailer from "nodemailer";

type ApplicationEmailInput = {
  to: string;
  listingTitle: string;
  candidateName: string;
  candidateEmail: string;
  motivation: string;
  cvUrl: string;
};

export async function sendApplicationEmail(input: ApplicationEmailInput) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM ?? "no-reply@colibrijobs.ro";

  if (!host || !user || !pass) {
    console.info("SMTP not configured; simulated application email:", input);
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: input.to,
    subject: `Aplicatie noua - ${input.listingTitle} | Colibri Jobs`,
    html: `
      <h2>Aplicatie noua primita</h2>
      <p><strong>Pozitie:</strong> ${input.listingTitle}</p>
      <p><strong>Candidat:</strong> ${input.candidateName} (${input.candidateEmail})</p>
      <p><strong>Mesaj:</strong></p>
      <p>${input.motivation}</p>
      <p><strong>CV:</strong> <a href="${input.cvUrl}">${input.cvUrl}</a></p>
      <hr />
      <p>Colibri Jobs - recrutare profesionala</p>
    `,
  });
}
