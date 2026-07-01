import { useContext, useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { ThemeContext } from "../context/ThemeContext";

function ProfilePanel() {
    const { darkMode } = useContext(ThemeContext);
    const [profile, setProfile] = useState(null);
    const [displayNameInput, setDisplayNameInput] = useState("");
    const [saving, setSaving] = useState(false);
    const user = auth.currentUser;
    const displayName = profile?.displayName || user?.displayName || "Varta User";

    useEffect(() => {
        if (!user?.uid) return;

        const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
            const data = snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
            setProfile(data);
        });

        return unsubscribe;
    }, [user?.uid]);

    useEffect(() => {
        if (profile?.displayName) {
            setDisplayNameInput(profile.displayName);
        } else if (user?.displayName) {
            setDisplayNameInput(user.displayName);
        }
    }, [profile, user?.displayName]);

    const saveDisplayName = async () => {
        if (!user?.uid) return;

        const trimmed = displayNameInput.trim();
        if (!trimmed) return;

        try {
            setSaving(true);
            await updateDoc(doc(db, "users", user.uid), {
                displayName: trimmed,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={`h-full p-6 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
            <div className={`rounded-xl border p-6 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
                <h2 className="text-xl font-semibold">Profile</h2>
                <p className={`mt-2 text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Your account details.</p>

                <div className="mt-6 space-y-3">
                    <div>
                        <p className="text-sm text-slate-500">Name</p>
                        <input
                            value={displayNameInput}
                            onChange={(e) => setDisplayNameInput(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            placeholder="Your display name"
                        />
                        <p className="mt-1 text-xs text-slate-500">This is the name shown to friends.</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Account</p>
                        <p className="font-medium">Active workspace</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Status</p>
                        <p className="font-medium">{profile?.online ? "Online" : "Offline"}</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={saveDisplayName}
                        disabled={!displayNameInput.trim() || saving}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                        {saving ? "Saving..." : "Save name"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfilePanel;