import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';

function VartaAIAssistant({ onSendMessage }) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'assistant',
            text: 'Hello! I can help with coding, writing, summaries, and everyday questions.',
        },
    ]);
    const [loading, setLoading] = useState(false);

    const quickPrompts = useMemo(() => [
        'Explain programming in simple terms',
        'Summarize this chat',
        'Write a professional email',
        'Help me fix grammar',
    ], []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        setLoading(true);

        try {
            const aiReply = `I can help with that. For now, this lightweight assistant responds with a helpful placeholder while keeping the app fast.\n\nYou asked: ${trimmed}`;
            setMessages((prev) => [
                ...prev,
                { id: `user-${Date.now()}`, role: 'user', text: trimmed },
                { id: `assistant-${Date.now() + 1}`, role: 'assistant', text: aiReply },
            ]);
            onSendMessage?.(aiReply);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { id: `user-${Date.now()}`, role: 'user', text: trimmed },
                { id: `assistant-${Date.now() + 1}`, role: 'assistant', text: 'I could not respond right now. Please try again.' },
            ]);
        } finally {
            setLoading(false);
            setInput('');
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Sparkles size={16} />
                </div>
                <div>
                    <p className="font-semibold">Varta AI</p>
                    <p className="text-sm text-slate-500">Helpful assistant</p>
                </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                    <button key={prompt} type="button" onClick={() => setInput(prompt)} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {prompt}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask Varta AI anything..."
                    className="min-h-24 w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none dark:border-slate-700"
                />
                <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                    {loading ? 'Thinking...' : 'Ask AI'}
                </button>
            </form>

            <div className="mt-4 space-y-2">
                {messages.map((message) => (
                    <div key={message.id} className={`rounded-xl px-3 py-2 text-sm ${message.role === 'assistant' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' : 'ml-auto bg-blue-600 text-white'}`}>
                        <p className="whitespace-pre-line">{message.text}</p>
                    </div>
                ))}
            </div>
            {loading ? <p className="mt-3 text-sm text-slate-500">Typing...</p> : null}
        </div>
    );
}

export default VartaAIAssistant;
