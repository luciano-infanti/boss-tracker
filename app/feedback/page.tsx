'use client';

import { useState } from 'react';
import { submitFeedback } from '@/app/actions/feedback';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export default function FeedbackPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        const formData = new FormData(e.currentTarget);
        const result = await submitFeedback(formData);

        if (result.success) {
            setStatus('success');
            e.currentTarget.reset();
        } else {
            setStatus('error');
            setErrorMessage(result.error || 'Something went wrong. Please try again.');
        }
    };

    if (status === 'success') {
        return (
            <PageTransition>
                <div className="max-w-md mx-auto mt-12 p-8 bg-surface border border-border rounded-lg text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="text-emerald-400 w-16 h-16" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
                    <p className="text-secondary mb-6">
                        Your feedback has been sent successfully. We appreciate your input!
                    </p>
                    <button
                        onClick={() => setStatus('idle')}
                        className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition-colors"
                    >
                        Send Another
                    </button>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Feedback</h1>
                    <p className="text-secondary">
                        Found a bug or have a suggestion? Let us know!
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="type" className="text-sm font-medium text-secondary">
                                Type
                            </label>
                            <select
                                name="type"
                                id="type"
                                className="w-full px-4 py-2 bg-background border border-border rounded-md text-white focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="bug">Bug Report</option>
                                <option value="suggestion">Suggestion</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-secondary">
                                Email <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                required
                                placeholder="your@email.com"
                                className="w-full px-4 py-2 bg-background border border-border rounded-md text-white placeholder-secondary/50 focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium text-secondary">
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            placeholder="Brief summary of the issue or idea"
                            className="w-full px-4 py-2 bg-background border border-border rounded-md text-white placeholder-secondary/50 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium text-secondary">
                            Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            required
                            rows={5}
                            placeholder="Please provide details..."
                            className="w-full px-4 py-2 bg-background border border-border rounded-md text-white placeholder-secondary/50 focus:outline-none focus:border-primary transition-colors resize-none"
                        />
                    </div>

                    {status === 'error' && (
                        <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-md flex items-center gap-3 text-red-400">
                            <AlertCircle size={20} />
                            <p className="text-sm">{errorMessage}</p>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
                        >
                            {status === 'loading' ? (
                                'Sending...'
                            ) : (
                                <>
                                    <Send size={18} />
                                    Send Feedback
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </PageTransition>
    );
}
