const createProfileBio = ({ interests = '', skills = '', profession = '', hobbies = '' }) => {
    const parts = [profession, interests, skills, hobbies].filter(Boolean);

    if (parts.length === 0) {
        return 'A curious and motivated professional focused on growth and collaboration.';
    }

    const interestText = interests ? ` with a passion for ${interests}` : '';
    const skillText = skills ? ` and strong skills in ${skills}` : '';
    const hobbyText = hobbies ? `, who enjoys ${hobbies}` : '';

    return `${profession || 'A thoughtful professional'}${interestText}${skillText}${hobbyText}.`;
};

const fixGrammar = (text = '') => {
    const trimmed = text.trim();
    if (!trimmed) return '';

    return trimmed
        .replace(/\bim\b/gi, 'I\'m')
        .replace(/\bi am\b/gi, 'I am')
        .replace(/\bthats\b/gi, "that's")
        .replace(/\bcan not\b/gi, 'cannot')
        .replace(/\b(\w)(?=\s+[.!?])/, '$1')
        .replace(/\s+/g, ' ');
};

const summarizeMessages = (messages = []) => {
    const text = messages
        .map((message) => message?.text)
        .filter(Boolean)
        .join(' ');

    const summary = text
        ? `Conversation summary: ${text.slice(0, 120)}${text.length > 120 ? '...' : ''}`
        : 'No messages to summarize.';

    const importantPoints = messages.length > 0
        ? messages.filter((message) => message?.text?.length > 8).slice(0, 3).map((message) => message.text)
        : [];

    const actionItems = messages.filter((message) => /tomorrow|later|next|follow|check|send/i.test(message?.text || '')).slice(0, 2).map((message) => message.text);
    const questions = messages.filter((message) => /\?/i.test(message?.text || '')).map((message) => message.text);

    return {
        summary,
        importantPoints,
        actionItems,
        questions,
    };
};

export { createProfileBio, fixGrammar, summarizeMessages };
