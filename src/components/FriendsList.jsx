import {
    useContext,
    useEffect,
    useState,
} from "react";

import {
    collection,
    onSnapshot,
} from "firebase/firestore";

import {
    auth,
    db,
} from "../firebase/firebase";
import { ThemeContext } from "../context/ThemeContext";
import { getPresenceMeta } from "../utils/presence";

function FriendsList({ onSelectFriend, selectedChatId }) {
    const { darkMode } = useContext(ThemeContext);
    const [friends, setFriends] =
        useState([]);

    const getDisplayName = (user) => user?.displayName || "User";

    useEffect(() => {
        if (!auth.currentUser) {
            setFriends([]);
            return;
        }

        let currentFriendIds = [];
        let userDocs = [];

        const syncFriends = () => {
            const matchingFriends = currentFriendIds
                .map((friendId) => userDocs.find((userDoc) => userDoc.id === friendId))
                .filter(Boolean)
                .map((userDoc) => ({ id: userDoc.id, ...userDoc.data() }));

            setFriends(matchingFriends);
        };

        const unsubscribeFriends = onSnapshot(
            collection(db, "friends", auth.currentUser.uid, "userFriends"),
            (snapshot) => {
                currentFriendIds = snapshot.docs.map((doc) => doc.id);
                syncFriends();
            }
        );

        const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
            userDocs = snapshot.docs;
            syncFriends();
        });

        return () => {
            unsubscribeFriends();
            unsubscribeUsers();
        };
    }, []);

    return (
        <div className={`p-3 ${darkMode ? "text-white" : "text-slate-800"}`}>
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-semibold">Friends</h1>
                <span className={`rounded-full px-3 py-1 text-xs ${darkMode ? "bg-slate-800 text-slate-300" : "bg-white text-slate-500"}`}>{friends.length}</span>
            </div>

            {friends.length === 0 ? (
                <p className={darkMode ? "text-slate-400" : "text-slate-500"}>No friends yet</p>
            ) : (
                friends.map((friend) => {
                    const presence = getPresenceMeta(friend);
                    return (
                        <button key={friend.id} type="button" onClick={() => onSelectFriend?.(friend)} className={`mb-3 flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${selectedChatId === friend.id ? (darkMode ? "border-blue-500 bg-slate-800" : "border-blue-500 bg-blue-50") : darkMode ? "border-slate-800 bg-slate-900/70" : "border-slate-200 bg-white"}`}>
                            <div className="relative">
                                <img src={`https://ui-avatars.com/api/?name=${friend.displayName || "User"}`} className="h-12 w-12 rounded-full" alt={friend.displayName || "User avatar"} />
                                <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 ${darkMode ? "border-slate-900" : "border-white"} ${presence.dotClass}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold">{getDisplayName(friend)}</h3>
                                <p className={`text-sm ${presence.isOnline ? "text-emerald-400" : darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                    {presence.lastSeenLabel}
                                </p>
                            </div>
                        </button>
                    );
                })
            )}
        </div>
    );
}

export default FriendsList;
