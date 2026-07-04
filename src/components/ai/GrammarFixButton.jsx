import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { fixGrammar } from '../../services/aiService';

function GrammarFixButton({ value, onApply }) {
    const [preview, setPreview] = useState('');

    const handleSuggest = () => {
        const corrected = fixGrammar(value);
        setPreview(corrected);
    };

    return (
        <div className="mt-2 space-y-2">
            <button type="button" onClick={handleSuggest} className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <Sparkles size={14} /> ✨ Fix Grammar
            </button>
            {preview ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                    <p className="mb-2">{preview}</p>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => onApply?.(preview)} className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                            Accept
                        </button>
                        <button type="button" onClick={() => setPreview('')} className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            Reject
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default GrammarFixButton;
