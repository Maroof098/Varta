import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDoc, query, setDoc, serverTimestamp, where, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { MessageSquare, User, Users, Bell, LogOut, Moon, Sun, X } from "lucide-react";
import { auth, db } from "../firebase/firebase";
import { ChatContext } from "../context/ChatContext";
import { ThemeContext } from "../context/ThemeContext";
import vartaLogo from "../assets/hero.png";

function Sidebar({ activeTab, setActiveTab, onCloseMobile, mobile = false }) {
    const navigate = useNavigate();
    const { setSelectedUser } = useContext(ChatContext);
    const { darkMode, toggleTheme } = useContext(ThemeContext);
    const [profileName, setProfileName] = useState("");
    const [requestCount, setRequestCount] = useState(0);

    useEffect(() => {
        if (!auth.currentUser?.uid) return;

        const unsubscribe = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
            if (snapshot.exists()) {
                setProfileName(snapshot.data().displayName || "Varta User");
            }
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!auth.currentUser?.uid) return;

        const q = query(
            collection(db, "friendRequests"),
            where("receiverId", "==", auth.currentUser.uid),
            where("status", "==", "pending")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setRequestCount(snapshot.size);
        });

        return unsubscribe;
    }, []);

    const handleLogout = async () => {
        try {
            if (auth.currentUser) {
                await setDoc(doc(db, "users", auth.currentUser.uid), { online: false, lastSeen: serverTimestamp() }, { merge: true });
            }

            setSelectedUser(null);
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.log(error);
        }
    };

    const currentName = profileName || auth.currentUser?.displayName || "Varta User";

    const links = [
        { id: "chat", label: "Chat", icon: MessageSquare },
        { id: "friends", label: "Friends", icon: Users },
        { id: "requests", label: "Requests", icon: Bell },
        { id: "profile", label: "Profile", icon: User },
    ];

    return (
        <aside className={`flex h-full max-h-screen w-full flex-col border-r p-4 sm:p-5 overflow-y-auto ${darkMode ? "border-slate-800 bg-slate-950 text-slate-100" : "border-slate-200 bg-white text-slate-900"}`}>
            <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <img src={vartaLogo} alt="Varta logo" className="h-10 w-10 rounded-xl object-cover" />
                    <div>
                        <h2 className="text-lg font-semibold">Varta</h2>
                        <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Simple chat workspace</p>
                    </div>
                </div>
                {mobile && (
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        aria-label="Close menu"
                        className={`rounded-lg p-2 transition-colors ${darkMode ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            <div className={`mb-5 rounded-xl border p-3 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-slate-50"}`}>
                <p className="font-medium">{currentName}</p>
                <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Active workspace</p>
            </div>

            <nav className="space-y-2">
                {links.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => {
                            setActiveTab(id);
                            onCloseMobile?.();
                        }}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left ${activeTab === id ? (darkMode ? "bg-slate-800" : "bg-slate-100") : ""}`}
                    >
                        <div className="flex items-center gap-3">
                            <Icon size={18} />
                            <span>{label}</span>
                        </div>
                        {id === "requests" && requestCount > 0 && (
                            <span className="rounded-full bg-fuchsia-600 px-2 py-0.5 text-xs font-semibold text-white">{requestCount}</span>
                        )}
                    </button>
                ))}
            </nav>

            <div className="mt-auto space-y-2">
                <button type="button" onClick={toggleTheme} className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
                    {darkMode ? <><Sun size={16} />Light mode</> : <><Moon size={16} />Dark mode</>}
                </button>
                <button type="button" onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-white">
                    <LogOut size={16} />Logout
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;