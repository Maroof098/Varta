import { useMemo, useState } from 'react';

const DEFAULT_REPLIES = [
    'Sounds good.',
    "I'll check.",
    'Thank you!',
];

export function useSmartReplies() {
    const [suggestions, setSuggestions] = useState([]);

    const buildSuggestions = (message) => {
        const trimmed = (message || '').trim();
        if (!trimmed) {
            setSuggestions([]);
            return;
        }

        const replyPool = [
            'Sounds good.',
            "I'll check.",
            'Thank you!',
            'That works for me.',
            'Nice idea.',
        ];

        const keywordMatches = [];
        if (/thanks|thank/i.test(trimmed)) keywordMatches.push('Thank you!');
        if (/check|review|look/i.test(trimmed)) keywordMatches.push("I'll check.");
        if (/ok|good|sure|great/i.test(trimmed)) keywordMatches.push('Sounds good.');

        const nextSuggestions = [...new Set([...keywordMatches, ...replyPool])].slice(0, 3);
        setSuggestions(nextSuggestions);
    };

    const clearSuggestions = () => setSuggestions([]);

    const suggestionList = useMemo(() => suggestions, [suggestions]);

    return { suggestions: suggestionList, buildSuggestions, clearSuggestions };
}
