import { useMemo, useState } from 'react';
import { createProfileBio } from '../../services/aiService';

function GenerateBioPanel() {
    const [interests, setInterests] = useState('');
    const [skills, setSkills] = useState('');
    const [profession, setProfession] = useState('');
    const [hobbies, setHobbies] = useState('');
    const [bio, setBio] = useState('');

    const preview = useMemo(() => createProfileBio({ interests, skills, profession, hobbies }), [interests, skills, profession, hobbies]);

    const handleGenerate = () => setBio(preview);

    return (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-semibold">Generate Bio</h3>
            <div className="mt-3 space-y-2">
                <input value={interests} onChange={(event) => setInterests(event.target.value)} placeholder="Interests" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
                <input value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="Skills" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
                <input value={profession} onChange={(event) => setProfession(event.target.value)} placeholder="Profession" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
                <input value={hobbies} onChange={(event) => setHobbies(event.target.value)} placeholder="Hobbies" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
            </div>
            <button type="button" onClick={handleGenerate} className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
                Generate Bio
            </button>
            {bio ? <p className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-300">{bio}</p> : null}
            {!bio ? <p className="mt-3 text-sm text-slate-500">The AI will create a polished bio based on your details.</p> : null}
        </div>
    );
}

export default GenerateBioPanel;
