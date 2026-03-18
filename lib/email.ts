import { Resend } from 'resend';

type AssignmentMail = {
  to: string;
  username: string;
  sessionName: string;
  recipientName: string;
  deadline: string | null;
};

export async function sendAssignmentEmails(mails: AssignmentMail[]) {
  if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM) {
    console.warn('RESEND_API_KEY or MAIL_FROM missing. Assignment emails skipped.');
    return { skipped: true };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await Promise.all(
    mails.map((mail) =>
      resend.emails.send({
        from: process.env.MAIL_FROM!,
        to: mail.to,
        subject: `Dein Wichtel für ${mail.sessionName}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6">
            <h2>Hallo ${mail.username}</h2>
            <p>Die Auslosung für <strong>${mail.sessionName}</strong> ist abgeschlossen.</p>
            <p>Du wichtelst für: <strong>${mail.recipientName}</strong></p>
            <p>Deadline: <strong>${mail.deadline ?? 'nicht gesetzt'}</strong></p>
            <p>Bitte behalte diese Information geheim.</p>
          </div>
        `,
      }),
    ),
  );

  return { skipped: false };
}
