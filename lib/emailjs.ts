const {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
  EMAILJS_PRIVATE_KEY,
  ADMIN_EMAIL,
} = process.env;

export type EnrollmentPayload = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  course: string;
  category?: string;
  price?: string;
  registrationFee?: string;
  paymentNote?: string;
  months?: number;
  cohort: string;
  level: string;
  goals: string;
  plan: string;
};

function escape(s: string) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}

function buildTable(data: EnrollmentPayload) {
  const rows = [
    ["Course", data.course],
    ...(data.category ? [["Category", data.category]] : []),
    ...(data.months ? [["Duration", `${data.months} months`]] : []),
    ...(data.registrationFee
      ? [["Registration Fees", data.registrationFee]]
      : []),
    ...(data.price ? [["Course Price", data.price]] : []),
    ["Preferred Start", data.cohort],
    ["Payment Plan", data.plan],
    ["Level", data.level],
    ["Phone", data.phone],
    ["Country", data.country],
    ["Goals", data.goals],
  ]
    .map(
      ([k, v]) =>
        `<tr>
          <td style="padding:6px 0;color:#999;">${k}</td>
          <td style="padding:6px 0;text-align:right;font-weight:600;">${escape(String(v))}</td>
        </tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}</table>`;
}

function layout(title: string, bodyHtml: string, recipientEmail: string) {
  return `
  <div style="font-family:system-ui,sans-serif,Arial;font-size:14px;color:#333;padding:20px 14px;background:#f5f5f5;">
    <div style="max-width:600px;margin:auto;background:#fff;">
      <div style="text-align:center;background:#ffffff;padding:18px 14px;border-bottom:3px solid #FC400C;">
        <img src="https://unicomteam.com/images/unicomteam-logo-color.png" alt="UnicomTeam" width="137" height="40" style="display:inline-block;border:0;height:40px;width:137px;" />
      </div>
      <div style="padding:24px;">
        <h1 style="font-size:20px;margin:0 0 20px;">${title}</h1>
        ${bodyHtml}
        <p>Best regards,<br/><strong>UNICOMTEAM</strong></p>
      </div>
    </div>
    <p style="max-width:600px;margin:8px auto 0;color:#999;font-size:12px;">
      Sent to ${escape(recipientEmail)}.
    </p>
  </div>`;
}

// ── Core send — passes to_email both in URL params AND template_params ─────────
async function send(toEmail: string, subject: string, messageHtml: string) {
  if (
    !EMAILJS_SERVICE_ID ||
    !EMAILJS_TEMPLATE_ID ||
    !EMAILJS_PUBLIC_KEY ||
    !EMAILJS_PRIVATE_KEY
  ) {
    throw new Error("EmailJS env vars missing.");
  }

  const body = {
    service_id: EMAILJS_SERVICE_ID,
    template_id: EMAILJS_TEMPLATE_ID,
    user_id: EMAILJS_PUBLIC_KEY,
    accessToken: EMAILJS_PRIVATE_KEY,
    template_params: {
      to_email: toEmail, // ← must match your template's {{to_email}}
      subject, // ← must match your template's {{subject}}
      message_html: messageHtml, // ← must match your template's {{message_html}}
    },
  };

  console.log(`📧 Sending to: ${toEmail} | subject: ${subject}`);

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const responseText = await res.text();
  console.log(
    `EmailJS response for ${toEmail}: ${res.status} — ${responseText}`,
  );

  if (!res.ok) {
    throw new Error(`EmailJS failed (${res.status}): ${responseText}`);
  }

  return responseText;
}

export async function sendEnrollmentEmails(data: EnrollmentPayload) {
  const table = buildTable(data);
  const firstName = escape(data.fullName.split(" ")[0]);

  const paymentNotice = data.paymentNote
    ? `<p><strong>Payment:</strong> ${escape(data.paymentNote)}</p>`
    : "";

  const studentHtml = layout(
    "Enrollment Confirmed 🎉",
    `<p>Hi ${firstName},</p>
     <p>You're officially enrolled in <strong>${escape(data.course)}</strong>! Here's your summary:</p>
     ${table}
     ${paymentNotice}
     <p>Our team will reach out shortly with your next steps and cohort details.</p>`,
    data.email,
  );

  const adminHtml = layout(
    "New Enrollment Received",
    `<p>New enrollment from <strong>${escape(data.fullName)}</strong> (${escape(data.email)}):</p>
     ${table}`,
    ADMIN_EMAIL ?? "",
  );

  // Send both independently — one failure won't block the other
  const sends: Promise<string>[] = [
    send(data.email, `You're enrolled in ${data.course} 🎉`, studentHtml),
  ];

  if (ADMIN_EMAIL) {
    sends.push(
      send(
        ADMIN_EMAIL,
        `New enrollment: ${data.fullName} — ${data.course}`,
        adminHtml,
      ),
    );
  }

  const results = await Promise.allSettled(sends);

  results.forEach((r, i) => {
    const label = i === 0 ? "Student" : "Admin";
    if (r.status === "fulfilled") {
      console.log(`✅ ${label} email sent`);
    } else {
      console.error(`❌ ${label} email failed:`, r.reason);
    }
  });

  // Only hard-fail if student email didn't go out
  if (results[0].status === "rejected") {
    throw new Error(
      `Student email failed: ${(results[0] as PromiseRejectedResult).reason}`,
    );
  }
}

/* ── Certificate issued ──────────────────────────────────────────────────── */

export type CertificateEmail = {
  to: string;
  name: string;
  certNo: string;
  title: string; // "Certificate of Internship"
  program: string;
  downloadUrl: string;
  verifyUrl: string;
};

export async function sendCertificateEmail(d: CertificateEmail) {
  const firstName = escape(d.name.split(" ")[0]);
  const html = layout(
    `Your ${escape(d.title)} is ready 🎓`,
    `<p>Hi ${firstName},</p>
     <p>Congratulations on completing <strong>${escape(d.program)}</strong> with UnicomTeam. It was a pleasure having you, and your certificate is ready.</p>
     <p style="text-align:center;margin:28px 0;">
       <a href="${escape(d.downloadUrl)}" style="display:inline-block;background:#FC400C;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">Download your certificate</a>
     </p>
     <p><strong>Certificate number:</strong> ${escape(d.certNo)}</p>
     <p>Employers can confirm it's genuine by scanning the QR code on it, or at <a href="${escape(d.verifyUrl)}">${escape(d.verifyUrl)}</a>.</p>
     <p>Tip: add it to your LinkedIn profile under <em>Licenses &amp; certifications</em>, with UnicomTeam as the issuing organisation.</p>`,
    d.to,
  );
  return send(d.to, `Your UnicomTeam ${d.title} — ${d.certNo}`, html);
}

/* ── Contact form ────────────────────────────────────────────────────────── */

export type ContactPayload = {
  name: string;
  email: string;
  company?: string;
  service: string;
  budget?: string;
  timeline?: string;
  message: string;
};

/** Emails the team the enquiry, and the sender a short acknowledgement. */
export async function sendContactEmails(d: ContactPayload) {
  const rows = [
    ["Name", d.name],
    ["Email", d.email],
    ["Company", d.company],
    ["Service", d.service],
    ["Budget", d.budget],
    ["Timeline", d.timeline],
  ]
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:#999;">${k}</td><td style="padding:6px 0;text-align:right;font-weight:600;">${escape(String(v))}</td></tr>`,
    )
    .join("");
  const table = `<table style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}</table>`;
  const messageHtml = `<p style="white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:6px;">${escape(d.message)}</p>`;

  const sends: Promise<string>[] = [];
  if (ADMIN_EMAIL) {
    sends.push(
      send(
        ADMIN_EMAIL,
        `New enquiry: ${d.name} — ${d.service}`,
        layout(
          "New project enquiry",
          `${table}${messageHtml}<p>Reply straight to ${escape(d.email)}. It's also in admin → Messages.</p>`,
          ADMIN_EMAIL,
        ),
      ),
    );
  }
  sends.push(
    send(
      d.email,
      "We've received your message — UnicomTeam",
      layout(
        "Thanks for reaching out 👋",
        `<p>Hi ${escape(d.name.split(" ")[0])},</p>
         <p>We've received your message about <strong>${escape(d.service)}</strong> and will get back to you within 24 hours.</p>
         <p>Here's a copy of what you sent:</p>${messageHtml}`,
        d.email,
      ),
    ),
  );

  const results = await Promise.allSettled(sends);
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length === results.length) {
    throw new Error(
      `Contact emails failed: ${(failed[0] as PromiseRejectedResult).reason}`,
    );
  }
}
