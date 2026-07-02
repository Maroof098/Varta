import {
    useContext,
    useEffect,
    useState,
} from "react";

import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    setDoc,
    getDoc,
} from "firebase/firestore";

import {
    auth,
    db,
} from "../firebase/firebase";
import { ThemeContext } from "../context/ThemeContext";

function FriendRequests({ onSelectFriend }) {
    const { darkMode } = useContext(ThemeContext);
    const [requests, setRequests] =
        useState([]);
    const [profiles, setProfiles] = useState({});

    const getDisplayName = (user) => user?.displayName || "User";

    useEffect(() => {
        if (!auth.currentUser) return;

        const q = query(
            collection(db, "friendRequests"),
            where(
                "receiverId",
                "==",
                auth.currentUser.uid
            ),
            where(
                "status",
                "==",
                "pending"
            )
        );

        const unsubscribe =
            onSnapshot(q, async (snapshot) => {
                const requestsData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setRequests(requestsData);

                const profilesMap = {};
                await Promise.all(requestsData.map(async (request) => {
                    const userDoc = await getDoc(doc(db, "users", request.senderId));
                    profilesMap[request.senderId] = userDoc.exists() ? userDoc.data() : null;
                }));

                setProfiles(profilesMap);
            });

        return unsubscribe;
    }, []);

    const acceptRequest =
        async (request) => {
            try {
                await setDoc(
                    doc(
                        db,
                        "friends",
                        auth.currentUser.uid,
                        "userFriends",
                        request.senderId
                    ),
                    {
                        uid:
                            request.senderId,
                    }
                );

                await setDoc(
                    doc(
                        db,
                        "friends",
                        request.senderId,
                        "userFriends",
                        auth.currentUser.uid
                    ),
                    {
                        uid:
                            auth.currentUser.uid,
                    }
                );

                await updateDoc(
                    doc(
                        db,
                        "friendRequests",
                        request.id
                    ),
                    {
                        status:
                            "accepted",
                    }
                );
            } catch (err) {
                console.log(err);
            }
        };

    const rejectRequest =
        async (request) => {
            await updateDoc(
                doc(
                    db,
                    "friendRequests",
                    request.id
                ),
                {
                    status:
                        "rejected",
                }
            );
        };

    return (
        <div className={`p-3 ${darkMode ? "text-white" : "text-slate-800"}`}>
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-semibold">Friend Requests</h1>
                <span className={`rounded-full px-3 py-1 text-xs ${darkMode ? "bg-slate-800 text-slate-300" : "bg-white text-slate-500"}`}>{requests.length}</span>
            </div>

            {requests.length === 0 ? (
                <p className={darkMode ? "text-slate-400" : "text-slate-500"}>No requests</p>
            ) : (
                requests.map((req) => {
                    const profile = profiles[req.senderId];
                    const label = profile ? getDisplayName(profile) : "Deleted user";

                    return (
                        <div key={req.id} className={`mb-3 rounded-2xl border p-4 ${darkMode ? "border-slate-800 bg-slate-900/70" : "border-slate-200 bg-white"}`}>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold">{label}</h3>
                                    <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{profile ? "Pending connection" : "Account deleted"}</p>
                                </div>
                                {onSelectFriend && profile && (
                                    <button type="button" onClick={() => onSelectFriend({ id: req.senderId, ...profile })} className="rounded-xl border border-cyan-500/20 px-3 py-2 text-sm text-cyan-400">Chat</button>
                                )}
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => profile && acceptRequest(req)}
                                    disabled={!profile}
                                    className={`rounded-xl px-4 py-2 text-sm ${profile ? "bg-emerald-600" : "bg-slate-500 text-slate-200 cursor-not-allowed"}`}
                                >
                                    {profile ? "Accept" : "Deleted"}
                                </button>
                                <button onClick={() => rejectRequest(req)} className="rounded-xl bg-rose-600 px-4 py-2 text-sm">Reject</button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default FriendRequests;