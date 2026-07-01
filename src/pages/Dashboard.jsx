import { useContext, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import ProfilePanel from "../components/ProfilePanel";
import FriendRequests from "../components/FriendRequests";
import FriendsList from "../components/FriendsList";
import { ThemeContext } from "../context/ThemeContext";
import { ChatContext } from "../context/ChatContext";
import { auth, db } from "../firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";

function Dashboard() {
    const { darkMode } = useContext(ThemeContext);
    const { setSelectedUser } = useContext(ChatContext);
    const [activeTab, setActiveTab] = useState("chat");
    const [users, setUsers] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileMenuOpen]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const arr = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setUsers(arr.filter((user) => user.id !== auth.currentUser?.uid));
        });

        return unsubscribe;
    }, []);

    const renderMain = () => {
        if (activeTab === "friends") {
            return (
                <div className="h-full overflow-y-auto p-6">
                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className={`rounded-xl border p-4 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
                            <FriendsList onSelectFriend={(friend) => { setSelectedUser(friend); setActiveTab("chat"); }} />
                        </div>
                        <div className={`rounded-xl border p-4 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
                            <FriendRequests onSelectFriend={(friend) => { setSelectedUser(friend); setActiveTab("chat"); }} />
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === "profile") {
            return <ProfilePanel />;
        }

        return (
            <div className="flex h-full flex-col">
                <div className="flex-1 overflow-hidden">
                    <ChatBox />
                </div>
                <div className={`border-t p-4 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
                    <h3 className="mb-2 font-medium">People</h3>
                    <div className="space-y-2">
                        {users.map((user) => (
                            <button
                                key={user.id}
                                type="button"
                                onClick={() => { setSelectedUser(user); setActiveTab("chat"); }}
                                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left ${darkMode ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"}`}
                            >
                                <span>{user.displayName || "Varta User"}</span>
                                <span className={user.online ? "text-emerald-500" : "text-slate-400"}>{user.online ? "Online" : "Offline"}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen overflow-x-hidden ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}>
            <div className={`mx-auto flex h-screen max-w-7xl flex-col overflow-hidden md:flex-row ${darkMode ? "bg-slate-900" : "bg-white"}`}>
                <div className="hidden md:block">
                    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>

                <div className={`fixed inset-0 z-20 bg-slate-900/40 md:hidden ${mobileMenuOpen ? "block" : "hidden"}`} onClick={() => setMobileMenuOpen(false)} />
                <div className={`fixed inset-y-0 left-0 z-30 w-72 transition-transform duration-200 md:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onCloseMobile={() => setMobileMenuOpen(false)} mobile />
                </div>

                <main className="flex-1 min-h-0 overflow-hidden">
                    <div className={`flex items-center justify-between border-b px-4 py-3 md:hidden ${darkMode ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"}`}>
                        <div className="font-semibold">Varta</div>
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className={`rounded-lg p-2 transition-colors ${darkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-100 hover:bg-slate-200"}`}
                            aria-label="Open menu"
                        >
                            <Menu size={18} />
                        </button>
                    </div>
                    {renderMain()}
                </main>
            </div>
        </div>
    );
}

export default Dashboard;