/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";
import { getConversationId } from "../utils/presence";
import { auth } from "../firebase/firebase";

export const ChatContext = createContext();

export function ChatProvider({ children }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);
    const [selectedConversationId, setSelectedConversationId] = useState(null);

    const currentUserId = auth.currentUser?.uid;
    const chatId = selectedUser?.id && currentUserId ? getConversationId(currentUserId, selectedUser.id) : null;

    return (
        <ChatContext.Provider
            value={{
                selectedUser,
                setSelectedUser,
                selectedChat,
                setSelectedChat,
                selectedConversationId,
                setSelectedConversationId,
                chatId,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}