import {
    useContext,
    useEffect,
    useState,
} from "react";

import {
    collection,
    onSnapshot,
    getDoc,
    doc,
} from "firebase/firestore";

import {
    auth,
    db,
} from "../firebase/firebase";
import { ThemeContext } from "../context/ThemeContext";

function FriendsList({ onSelectFriend }) {
    const { darkMode } = useContext(ThemeContext);
    const [friends, setFriends] =
        useState([]);

    const getDisplayName = (user) => user?.displayName || user?.email?.split("@")[0] || "User";

    useEffect(() => {
        if (!auth.currentUser)
            return;

        const unsubscribe =
            onSnapshot(
                collection(
                    db,
                    "friends",
                    auth.currentUser.uid,
                    "userFriends"
                ),
                async (snapshot) => {
                    const arr =
                        await Promise.all(
                            snapshot.docs.map(
                                async (f) => {
                                    const userDoc =
                                        await getDoc(
                                            doc(
                                                db,
                                                "users",
                                                f.id
                                            )
                                        );

                                    return {
                                        id: f.id,
                                        ...userDoc.data(),
                                    };
                                }
                            )
                        );

                    setFriends(arr);
                }
            );

        return unsubscribe;
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
                friends.map((friend) => (
                    <button key={friend.id} type="button" onClick={() => onSelectFriend?.(friend)} className={`mb-3 flex w-full items-center gap-4 rounded-2xl border p-4 text-left ${darkMode ? "border-slate-800 bg-slate-900/70" : "border-slate-200 bg-white"}`}>
                        <img src={`https://ui-avatars.com/api/?name=${friend.displayName || friend.email || "User"}`} className="h-12 w-12 rounded-full" alt="" />
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold">{getDisplayName(friend)}</h3>
                            <p className={`text-sm ${friend.online ? "text-emerald-400" : darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                {friend.online ? "● Online" : "● Offline"}
                            </p>
                        </div>
                    </button>
                ))
            )}
        </div>
    );
}

export default FriendsList;
