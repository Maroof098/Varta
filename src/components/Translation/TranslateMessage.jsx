import { useMemo, useState } from 'react';

const LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ur', label: 'Urdu' },
    { value: 'te', label: 'Telugu' },
    { value: 'ta', label: 'Tamil' },
    { value: 'kn', label: 'Kannada' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'es', label: 'Spanish' },
    { value: 'ar', label: 'Arabic' },
];

function TranslateMessage({ text }) {
    const [language, setLanguage] = useState('hi');
    const [translated, setTranslated] = useState('');
    const [showTranslated, setShowTranslated] = useState(false);

    const translatedText = useMemo(() => translated || text, [translated, text]);

    const handleTranslate = () => {
        if (!text) return;

        const map = {
            en: 'English',
            hi: 'Hindi',
            ur: 'Urdu',
            te: 'Telugu',
            ta: 'Tamil',
            kn: 'Kannada',
            fr: 'French',
            de: 'German',
            es: 'Spanish',
            ar: 'Arabic',
        };

        setTranslated(`[${map[language] || 'Translated'}] ${text}`);
        setShowTranslated(true);
    };

    return (
        <div className="mt-2 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900">
                    {LANGUAGES.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                </select>
                <button type="button" onClick={handleTranslate} className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    Translate
                </button>
                {translated ? (
                    <button type="button" onClick={() => setShowTranslated((value) => !value)} className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                        {showTranslated ? 'Original' : 'Translated'}
                    </button>
                ) : null}
            </div>
            {translated ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">{showTranslated ? translatedText : text}</p>
            ) : null}
        </div>
    );
}

export default TranslateMessage;
