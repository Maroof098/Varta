import test from 'node:test';
import assert from 'node:assert/strict';
import { getPresenceMeta } from './presence.js';

test('marks a user offline when online is true but lastSeen is stale', () => {
    const staleSeen = new Date(Date.now() - 10 * 60 * 1000);

    const meta = getPresenceMeta({ online: true, lastSeen: staleSeen });

    assert.equal(meta.isOnline, false);
    assert.equal(meta.label, 'Offline');
});
