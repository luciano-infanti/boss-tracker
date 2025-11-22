'use server';

import nodemailer from 'nodemailer';

export async function submitFeedback(formData: FormData) {
    const type = formData.get('type') as string;
    const email = formData.get('email') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!email || !title || !description) {
        return { success: false, error: 'Please fill in all required fields.' };
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Missing email credentials in .env.local');
        return { success: false, error: 'Server configuration error: Missing email credentials.' };
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'lucianoinfanti369@gmail.com', // Sending to yourself
            replyTo: email, // So you can reply to the user directly
            subject: `[Boss Tracker Feedback] ${type.toUpperCase()}: ${title}`,
            text: `
New Feedback Received:

Type: ${type}
From: ${email}

Title: ${title}

Description:
${description}
            `,
            html: `
                <h2>New Feedback Received</h2>
                <p><strong>Type:</strong> ${type}</p>
                <p><strong>From:</strong> ${email}</p>
                <hr />
                <h3>${title}</h3>
                <p>${description}</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully');
        return { success: true };

    } catch (error) {
        console.error('❌ Error sending email:', error);
        // Return the error message to the client for debugging (in a real app, we might hide this)
        return { success: false, error: `Failed to send email: ${(error as Error).message}` };
    }
}
