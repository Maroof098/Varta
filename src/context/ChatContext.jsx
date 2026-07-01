import {
    createContext,
    useState,
} from "react";

import { auth } from "../firebase/firebase";

export const ChatContext =
    createContext();

export function ChatProvider({
    children,
}) {
    const [
        selectedUser,
        setSelectedUser,
    ] = useState(null);

    const chatId =
        selectedUser &&
            auth.currentUser
            ? [auth.currentUser.uid,
            selectedUser.id]
                .sort()
                .join("_")
            : null;

    return (
        <ChatContext.Provider
            value={{
                selectedUser,
                setSelectedUser,
                chatId,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}