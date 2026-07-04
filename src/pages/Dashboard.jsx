import { Suspense, lazy, useContext, useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import ProfilePanel from "../components/ProfilePanel";
import FriendRequests from "../components/FriendRequests";
import FriendsList from "../components/FriendsList";
import { ThemeContext } from "../context/ThemeContext";
import { ChatContext } from "../context/ChatContext";
import { auth, db } from "../firebase/firebase";
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { bindPresenceLifecycle, getPresenceMeta, setUserPresence } from "../utils/presence";

const VartaAIAssistant = lazy(() => import("../components/ai/VartaAIAssistant"));

function Dashboard() {
    const { darkMode } = useContext(ThemeContext);
    const { selectedChat, setSelectedUser, setSelectedChat, setSelectedConversationId } = useContext(ChatContext);
    const [activeTab, setActiveTab] = useState("chat");
    const [users, setUsers] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [friendIds, setFriendIds] = useState([]);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileMenuOpen]);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (!user?.uid) {
                if (auth.currentUser?.uid) {
                    await setUserPresence(db, auth.currentUser.uid, false);
                }
                return;
            }

            await setUserPresence(db, user.uid, true);
        });

        return () => {
            unsubscribeAuth();
        };
    }, []);

    useEffect(() => {
        if (!auth.currentUser?.uid) return;
        return bindPresenceLifecycle(db, auth.currentUser.uid);
    }, [auth.currentUser?.uid]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const arr = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setUsers(arr.filter((user) => user.id !== auth.currentUser?.uid));
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!auth.currentUser) return;

        const q = query(
            collection(db, "friendRequests"),
            where("status", "==", "pending")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const arr = snapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .filter((request) =>
                    request.senderId === auth.currentUser.uid ||
                    request.receiverId === auth.currentUser.uid
                );

            setPendingRequests(arr);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!auth.currentUser) return;

        const q1 = query(collection(db, "friends"), where("user1", "==", auth.currentUser.uid));
        const q2 = query(collection(db, "friends"), where("user2", "==", auth.currentUser.uid));

        let docs1 = [];
        let docs2 = [];

        const updateFriendIds = () => {
            const combined = [...docs1, ...docs2];
            const ids = combined.map((friendDoc) => {
                const data = friendDoc.data();
                return data.user1 === auth.currentUser.uid ? data.user2 : data.user1;
            });
            setFriendIds(ids);
        };

        const unsub1 = onSnapshot(q1, (snapshot) => {
            docs1 = snapshot.docs;
            updateFriendIds();
        });

        const unsub2 = onSnapshot(q2, (snapshot) => {
            docs2 = snapshot.docs;
            updateFriendIds();
        });

        return () => {
            unsub1();
            unsub2();
        };
    }, []);

    const handleSelectFriend = (friend) => {
        if (!friend?.id) return;

        setSelectedUser(friend);
        setSelectedChat(friend.id);
        setSelectedConversationId(
            auth.currentUser?.uid && friend.id
                ? [auth.currentUser.uid, friend.id].sort().join("_")
                : friend.id
        );
        setActiveTab("chat");
    };

    const sortedUsers = useMemo(() => {
        return [...users].sort((left, right) => {
            const leftPresence = getPresenceMeta(left);
            const rightPresence = getPresenceMeta(right);

            if (leftPresence.isOnline === rightPresence.isOnline) {
                return (left.displayName || "").localeCompare(right.displayName || "");
            }
            return leftPresence.isOnline ? -1 : 1;
        });
    }, [users]);

    const sendFriendRequest = async (user) => {
        if (!auth.currentUser || user.id === auth.currentUser.uid) return;

        const existing = pendingRequests.find(
            (request) =>
                (request.senderId === auth.currentUser.uid && request.receiverId === user.id) ||
                (request.senderId === user.id && request.receiverId === auth.currentUser.uid)
        );

        if (existing || friendIds.includes(user.id)) {
            setFeedbackMessage("Unable to send request: already friends or request exists.");
            return;
        }

        const requestId = [auth.currentUser.uid, user.id].sort().join("_");

        try {
            await setDoc(doc(db, "friendRequests", requestId), {
                senderId: auth.currentUser.uid,
                senderName: auth.currentUser.displayName || "Varta User",
                senderEmail: auth.currentUser.email || "",
                receiverId: user.id,
                receiverName: user.displayName || "Varta User",
                receiverEmail: user.email || "",
                status: "pending",
                createdAt: serverTimestamp(),
            });
            setFeedbackMessage("Friend request sent.");
        } catch (err) {
            console.error(err);
            setFeedbackMessage("Failed to send friend request.");
        }
    };

    const getPeopleAction = (user) => {
        if (friendIds.includes(user.id)) {
            return { label: "Friends", disabled: false, onClick: () => handleSelectFriend(user) };
        }

        const request = pendingRequests.find(
            (request) =>
                (request.senderId === auth.currentUser.uid && request.receiverId === user.id) ||
                (request.senderId === user.id && request.receiverId === auth.currentUser.uid)
        );

        if (request) {
            return { label: request.senderId === auth.currentUser.uid ? "Request Sent" : "Pending", disabled: true };
        }

        return { label: "Add Friend", disabled: false, onClick: () => sendFriendRequest(user) };
    };

    const renderMain = () => {
        if (activeTab === "friends") {
            return (
                <div className="h-full overflow-y-auto p-6">
                    <div className={`rounded-xl border p-4 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
                        <FriendsList onSelectFriend={handleSelectFriend} selectedChatId={selectedChat} />
                    </div>
                </div>
            );
        }

        if (activeTab === "requests") {
            return (
                <div className="h-full overflow-y-auto p-6">
                    <div className={`rounded-xl border p-4 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
                        <FriendRequests />
                    </div>
                </div>
            );
        }

        if (activeTab === "profile") {
            return <ProfilePanel />;
        }

        if (activeTab === "ai") {
            return (
                <div className="h-full overflow-y-auto p-6">
                    <div className={`rounded-xl border p-4 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold">Varta AI</h3>
                            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>A dedicated assistant chat, separate from your personal conversations.</p>
                        </div>
                        <Suspense fallback={<div className="text-sm text-slate-500">Loading assistant...</div>}>
                            <VartaAIAssistant />
                        </Suspense>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex h-full flex-col lg:flex-row">
                <div className={`w-full lg:w-96 shrink-0 border-b lg:border-b-0 lg:border-r p-4 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
                    <h3 className="mb-4 font-medium">People</h3>
                    {feedbackMessage ? <p className="mb-3 text-sm text-blue-600">{feedbackMessage}</p> : null}
                    <div className="space-y-3">
                        {sortedUsers.map((user) => {
                            const action = getPeopleAction(user);
                            const presence = getPresenceMeta(user);
                            const isActive = selectedChat === user.id;

                            return (
                                <button key={user.id} type="button" onClick={() => handleSelectFriend(user)} className={`w-full rounded-2xl border px-3 py-3 text-left transition ${isActive ? (darkMode ? "border-blue-500 bg-slate-800" : "border-blue-500 bg-blue-50") : darkMode ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"}`}>
                                    <div className="mb-3 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img src={`https://ui-avatars.com/api/?name=${user.displayName || "Varta User"}`} className="h-10 w-10 rounded-full" alt="" />
                                                <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${darkMode ? "border-slate-950" : "border-white"} ${presence.dotClass}`} />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{user.displayName || "Varta User"}</p>
                                                <p className={`text-sm ${presence.isOnline ? "text-emerald-500" : "text-slate-500"}`}>{presence.lastSeenLabel}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                if (action.disabled) return;
                                                if (action.label === "Add Friend") {
                                                    void sendFriendRequest(user);
                                                    return;
                                                }
                                                handleSelectFriend(user);
                                            }}
                                            disabled={action.disabled}
                                            className={`rounded-full px-3 py-1 text-sm font-semibold ${action.disabled ? "bg-slate-500 text-slate-200" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                                        >
                                            {action.label}
                                        </button>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    <ChatBox />
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