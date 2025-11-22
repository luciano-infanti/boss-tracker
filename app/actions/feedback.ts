'use server';

export async function submitFeedback(formData: FormData) {
    const type = formData.get('type') as string;
    const email = formData.get('email') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!email || !title || !description) {
        return { success: false, error: 'Please fill in all required fields.' };
    }

    // Rate limiting simulation (basic)
    // In a real app, we'd use a database or Redis to track IP/User submissions

    console.log('📨 New Feedback Received:');
    console.log('Type:', type);
    console.log('Email:', email);
    console.log('Title:', title);
    console.log('Description:', description);
    console.log('To: lucianoinfanti369@gmail.com');

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true };
}
