import test from 'node:test';
import assert from 'node:assert/strict';
import { createProfileBio, fixGrammar, summarizeMessages } from './aiService.js';

test('creates a bio that mentions the profession and interests', () => {
    const bio = createProfileBio({
        interests: 'reading, hiking',
        skills: 'React, Firebase',
        profession: 'Frontend developer',
        hobbies: 'music, travel',
    });

    assert.match(bio.toLowerCase(), /frontend developer/);
    assert.match(bio.toLowerCase(), /reading/);
});

test('summarizes messages into sections', () => {
    const summary = summarizeMessages([
        { text: 'Hello there', senderId: 'me' },
        { text: 'Can you help with React?', senderId: 'other' },
        { text: 'Yes, I can help tomorrow.', senderId: 'me' },
    ]);

    assert.equal(summary.summary.length > 0, true);
    assert.equal(summary.importantPoints.length > 0, true);
    assert.equal(summary.actionItems.length > 0, true);
    assert.equal(summary.questions.length > 0, true);
});
test('improves clear grammar while preserving meaning', () => {
    const corrected = fixGrammar('i am very excited to help you today');

    assert.match(corrected.toLowerCase(), /i am/);
    assert.match(corrected.toLowerCase(), /excited/);
    assert.match(corrected.toLowerCase(), /today/);
});