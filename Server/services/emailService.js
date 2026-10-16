
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendPasswordResetEmail(email, resetUrl) {
    const result = await transporter.sendMail({
        from: `"FixFlow Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset your FixFlow password",
        text: `Open this link to reset your password: ${resetUrl}\n\nThis link expires in 15 minutes.`,
        html: `
            <div style="font-family:Arial,sans-serif;padding:24px">
                <h2>FixFlow Password Reset</h2>
                <p>We received a request to reset your password.</p>
                <p>
                    <a href="${resetUrl}"
                       style="background:#2563eb;color:#fff;padding:12px 20px;
                       text-decoration:none;border-radius:6px">
                       Reset Password
                    </a>
                </p>
                <p>This link expires in 15 minutes.</p>
                <p>If you did not request this, ignore this email.</p>
            </div>
        `,
    });

    console.log("Password reset email accepted:", result.messageId);
    return result;
}

module.exports = { sendPasswordResetEmail };
