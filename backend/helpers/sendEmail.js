import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({email, subject, message}) {
    const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: [email],
        subject: subject,
        html: message,
    });

    if (error) {
        return console.error("error is ",{ error });
    }
};

export default sendEmail;