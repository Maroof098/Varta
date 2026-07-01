import { useContext, useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";
import { ChatContext } from "../context/ChatContext";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

function ChatBox() {
    const { selectedUser, chatId } = useContext(ChatContext);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!chatId) {
            setMessages([]);
            return;
        }

        const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
        const unsub = onSnapshot(q, (snapshot) => {
            const loadedMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setMessages(loadedMessages);
        });

        return () => unsub();
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!message.trim() || !chatId || !selectedUser || !auth.currentUser?.uid) return;

        await addDoc(collection(db, "chats", chatId, "messages"), {
            text: message.trim(),
            senderId: auth.currentUser.uid,
            receiverId: selectedUser.id,
            createdAt: serverTimestamp(),
        });

        setMessage("");
        setShowEmojiPicker(false);
    };

    const insertEmoji = (emoji) => {
        setMessage((prev) => prev + emoji);
        setShowEmojiPicker(false);
    };

    const getDisplayName = (user) => user?.displayName || "User";

    if (!selectedUser) {
        return (
            <div className="flex h-full items-center justify-center p-6 text-slate-500">
                Select a person to start chatting.
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 border-b px-4 py-3 sm:px-5 sm:py-4">
                <img src={`https://ui-avatars.com/api/?name=${getDisplayName(selectedUser)}`} className="h-10 w-10 rounded-full" alt="" />
                <div>
                    <h3 className="font-medium">{getDisplayName(selectedUser)}</h3>
                    <p className={`text-sm ${selectedUser.online ? "text-emerald-500" : "text-slate-500"}`}>{selectedUser.online ? "Online" : "Offline"}</p>
                </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-4 sm:p-5">
                {messages.map((msg) => {
                    const senderName = msg.senderId === auth.currentUser?.uid ? (auth.currentUser?.displayName || "You") : getDisplayName(selectedUser);
                    return (
                        <div key={msg.id} className={`w-fit max-w-[85%] rounded-2xl px-3 py-2 ${msg.senderId === auth.currentUser?.uid ? "ml-auto bg-blue-600 text-white" : "bg-slate-100 text-slate-800"}`}>
                            <p className="text-[11px] font-semibold opacity-80">{senderName}</p>
                            <p className="break-words">{msg.text}</p>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-3 sm:p-4">
                <div className="relative flex flex-col gap-2 sm:flex-row">
                    <div className="relative">
                        <button type="button" onClick={() => setShowEmojiPicker((prev) => !prev)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-600">
                            <Smile size={18} />
                        </button>
                        {showEmojiPicker && (
                            <div className="absolute bottom-12 left-0 z-10 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                                {['😀', '😂', '❤️', '👍', '🔥', '🎉', '✨', '🙏'].map((emoji) => (
                                    <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} className="rounded-md p-1 text-xl">
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none"
                        placeholder="Type a message"
                    />
                    <button type="button" onClick={sendMessage} className="rounded-lg bg-blue-600 px-4 py-2 text-white">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatBox;