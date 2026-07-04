import { Suspense, lazy, useContext, useEffect, useRef, useState } from "react";
import { Smile, Sparkles, FileText } from "lucide-react";
import { ChatContext } from "../context/ChatContext";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { getPresenceMeta } from "../utils/presence";
import { useSmartReplies } from "../hooks/useSmartReplies";
import SmartReplySuggestions from "../components/ai/SmartReplySuggestions";
import TranslateMessage from "../components/Translation/TranslateMessage";
import GrammarFixButton from "../components/ai/GrammarFixButton";

const ChatSummaryModal = lazy(() => import("../components/Summary/ChatSummaryModal"));
const VartaAIAssistant = lazy(() => import("../components/ai/VartaAIAssistant"));

function ChatBox() {
    const { selectedUser, chatId } = useContext(ChatContext);
    const [draftMessages, setDraftMessages] = useState({});
    const [messages, setMessages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const messagesEndRef = useRef(null);
    const { suggestions, buildSuggestions, clearSuggestions } = useSmartReplies();

    const draftKey = chatId || "empty";
    const message = draftMessages[draftKey] || "";

    useEffect(() => {
        if (!chatId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
        const unsub = onSnapshot(q, (snapshot) => {
            const loadedMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setMessages(loadedMessages);
            setLoading(false);
        }, () => setLoading(false));

        return () => unsub();
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const updateDraft = (value) => {
        setDraftMessages((prev) => ({ ...prev, [draftKey]: value }));
    };

    const sendMessage = async (overrideText = message) => {
        const content = (overrideText || "").trim();
        if (!content || !chatId || !selectedUser || !auth.currentUser?.uid) return;

        await addDoc(collection(db, "chats", chatId, "messages"), {
            text: content,
            senderId: auth.currentUser.uid,
            receiverId: selectedUser.id,
            createdAt: serverTimestamp(),
        });

        updateDraft("");
        clearSuggestions();
        setShowEmojiPicker(false);
    };

    const insertEmoji = (emoji) => {
        updateDraft(`${message}${emoji}`);
        setShowEmojiPicker(false);
    };

    const getDisplayName = (user) => user?.displayName || "User";
    const presence = getPresenceMeta(selectedUser);

    useEffect(() => {
        if (!message) {
            clearSuggestions();
            return;
        }
        buildSuggestions(message);
    }, [message, buildSuggestions, clearSuggestions]);

    if (!selectedUser) {
        return (
            <div className="flex h-full items-center justify-center p-6 text-slate-500">
                Select a person to start chatting.
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img src={`https://ui-avatars.com/api/?name=${getDisplayName(selectedUser)}`} className="h-10 w-10 rounded-full" alt="" />
                        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${presence.dotClass}`} />
                    </div>
                    <div>
                        <h3 className="font-medium">{getDisplayName(selectedUser)}</h3>
                        <p className={`text-sm ${presence.isOnline ? "text-emerald-500" : "text-slate-500"}`}>{presence.lastSeenLabel}</p>
                    </div>
                </div>
                <button type="button" onClick={() => setShowSummary(true)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <span className="flex items-center gap-2"><FileText size={14} />Summarize</span>
                </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-4 sm:p-5">
                {loading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-12 animate-pulse rounded-2xl bg-slate-200" />
                        ))}
                    </div>
                ) : null}
                {messages.map((msg) => {
                    const senderName = msg.senderId === auth.currentUser?.uid ? (auth.currentUser?.displayName || "You") : getDisplayName(selectedUser);
                    return (
                        <div key={msg.id} className={`w-fit max-w-[85%] rounded-2xl px-3 py-2 ${msg.senderId === auth.currentUser?.uid ? "ml-auto bg-blue-600 text-white" : "bg-slate-100 text-slate-800"}`}>
                            <p className="text-[11px] font-semibold opacity-80">{senderName}</p>
                            <p className="break-words">{msg.text}</p>
                            <TranslateMessage text={msg.text} />
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-3 sm:p-4">
                <SmartReplySuggestions suggestions={suggestions} onSelect={(value) => {
                    updateDraft(value);
                    clearSuggestions();
                }} />
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
                        onChange={(e) => updateDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none"
                        placeholder="Type a message"
                    />
                    <div className="flex gap-2">
                        <button type="button" onClick={() => sendMessage(message)} className="rounded-lg bg-blue-600 px-4 py-2 text-white">
                            Send
                        </button>
                        <button type="button" onClick={() => setShowSummary(true)} className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            <span className="flex items-center gap-2"><Sparkles size={14} />AI</span>
                        </button>
                    </div>
                </div>
                <GrammarFixButton value={message} onApply={(value) => updateDraft(value)} />
            </div>
            <Suspense fallback={<div className="p-3 text-sm text-slate-500">Loading AI assistant...</div>}>
                <VartaAIAssistant onSendMessage={(reply) => sendMessage(reply)} />
            </Suspense>
            {showSummary ? (
                <Suspense fallback={null}>
                    <ChatSummaryModal messages={messages} onClose={() => setShowSummary(false)} />
                </Suspense>
            ) : null}
        </div>
    );
}

export default ChatBox;