const brand = {
  primary: "#6366F1",
  purple: "#8B5CF6",
  pink: "#EC4899",
  bg: "#F8FAFC",
};

export function verifyEmailTemplate({
  fullName,
  verifyUrl,
  appUrl,
}: {
  fullName: string;
  verifyUrl: string;
  appUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${brand.bg};font-family:Inter,Segoe UI,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${brand.bg};padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,.08);">
        <tr><td style="background:linear-gradient(135deg,${brand.primary},${brand.purple});padding:32px;text-align:center;">
          <div style="display:inline-block;background:rgba(255,255,255,.2);border-radius:12px;padding:10px 14px;color:#fff;font-weight:700;font-size:20px;">✓ TaskFlow</div>
        </td></tr>
        <tr><td style="padding:36px 32px;">
          <h1 style="margin:0 0 12px;color:#0F172A;font-size:24px;">Welcome, ${fullName}!</h1>
          <p style="margin:0 0 24px;color:#64748B;font-size:15px;line-height:1.6;">
            Thanks for joining TaskFlow. Please verify your email address to activate your account and start organizing your work.
          </p>
          <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(90deg,${brand.primary},${brand.pink});color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:600;font-size:15px;">
            Verify Email
          </a>
          <p style="margin:28px 0 0;color:#94A3B8;font-size:13px;line-height:1.5;">
            This link expires in 24 hours. If you didn’t create a TaskFlow account, you can ignore this email.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #E2E8F0;text-align:center;">
          <a href="${appUrl}" style="color:${brand.primary};text-decoration:none;font-size:13px;">taskflow.app</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function otpEmailTemplate({
  fullName,
  otp,
  appUrl,
}: {
  fullName: string;
  otp: string;
  appUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${brand.bg};font-family:Inter,Segoe UI,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${brand.bg};padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,.08);">
        <tr><td style="background:linear-gradient(135deg,${brand.primary},${brand.purple});padding:32px;text-align:center;">
          <div style="display:inline-block;background:rgba(255,255,255,.2);border-radius:12px;padding:10px 14px;color:#fff;font-weight:700;font-size:20px;">✓ TaskFlow</div>
        </td></tr>
        <tr><td style="padding:36px 32px;">
          <h1 style="margin:0 0 12px;color:#0F172A;font-size:24px;">Verify your email</h1>
          <p style="margin:0 0 20px;color:#64748B;font-size:15px;line-height:1.6;">
            Hi ${fullName}, use this one-time code to finish creating your TaskFlow account:
          </p>
          <div style="letter-spacing:8px;font-size:32px;font-weight:800;color:#0F172A;text-align:center;background:#F1F5F9;border-radius:14px;padding:18px 12px;margin:0 0 20px;">
            ${otp}
          </div>
          <p style="margin:0;color:#94A3B8;font-size:13px;line-height:1.5;">
            This code expires in 10 minutes. If you didn’t sign up for TaskFlow, you can ignore this email.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #E2E8F0;text-align:center;">
          <a href="${appUrl}" style="color:${brand.primary};text-decoration:none;font-size:13px;">taskflow.app</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function welcomeEmailTemplate({
  fullName,
  dashboardUrl,
}: {
  fullName: string;
  dashboardUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${brand.bg};font-family:Inter,Segoe UI,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${brand.bg};padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,.08);">
        <tr><td style="background:linear-gradient(135deg,${brand.primary},${brand.pink} 55%,${brand.purple});padding:40px 32px;text-align:center;">
          <div style="color:#fff;font-weight:700;font-size:22px;margin-bottom:8px;">TaskFlow</div>
          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;">You're in, ${fullName.split(" ")[0]}!</h1>
          <p style="margin:12px 0 0;color:rgba(255,255,255,.9);font-size:15px;">Your workspace is ready. Let’s get productive.</p>
        </td></tr>
        <tr><td style="padding:36px 32px;">
          <p style="margin:0 0 20px;color:#64748B;font-size:15px;line-height:1.6;">
            Create tasks, track progress, and collaborate with your team — all in one beautiful workspace.
          </p>
          <ul style="padding-left:18px;color:#475569;font-size:14px;line-height:1.8;margin:0 0 28px;">
            <li>Organize tasks by priority and status</li>
            <li>See your productivity at a glance</li>
            <li>Stay on top of upcoming deadlines</li>
          </ul>
          <a href="${dashboardUrl}" style="display:inline-block;background:linear-gradient(90deg,${brand.primary},${brand.purple});color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:600;font-size:15px;">
            Go to Dashboard
          </a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
