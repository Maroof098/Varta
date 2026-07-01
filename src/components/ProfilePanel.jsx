import { useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { ThemeContext } from "../context/ThemeContext";

function ProfilePanel() {
    const { darkMode } = useContext(ThemeContext);
    const [profile, setProfile] = useState(null);
    const user = auth.currentUser;
    const displayName = profile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Varta User";

    useEffect(() => {
        if (!user?.uid) return;

        const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
            setProfile(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
        });

        return unsubscribe;
    }, [user?.uid]);

    return (
        <div className={`h-full p-6 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
            <div className={`rounded-xl border p-6 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
                <h2 className="text-xl font-semibold">Profile</h2>
                <p className={`mt-2 text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Your account details.</p>

                <div className="mt-6 space-y-3">
                    <div>
                        <p className="text-sm text-slate-500">Name</p>
                        <p className="font-medium">{displayName}</p>
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
            </div>
        </div>
    );
}

export default ProfilePanel;