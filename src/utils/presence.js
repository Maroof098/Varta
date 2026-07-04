import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export const getConversationId = (uidA, uidB) => {
    if (!uidA || !uidB) return null;
    return [uidA, uidB].sort().join("_");
};

const formatTimeUnit = (value) => {
    if (value <= 1) return `${value} ${value === 1 ? "minute" : "minutes"}`;
    return `${value} minutes`;
};

const normalizeOnlineState = (value) => {
    if (typeof value === "boolean") return value;

    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["1", "true", "online", "yes"].includes(normalized)) return true;
        if (["0", "false", "offline", "no"].includes(normalized)) return false;
    }

    return Boolean(value);
};

const isRecentlyActive = (user) => {
    const value = user?.lastSeen;
    const timestamp = value?.toDate ? value.toDate() : value;

    if (!(timestamp instanceof Date) || Number.isNaN(timestamp.getTime())) {
        return false;
    }

    return Date.now() - timestamp.getTime() <= 2 * 60 * 1000;
};

export const formatLastSeen = (value) => {
    if (!value) return "Offline";

    const timestamp = value?.toDate ? value.toDate() : value;
    if (!(timestamp instanceof Date) || Number.isNaN(timestamp.getTime())) {
        return "Offline";
    }

    const seconds = Math.max(0, Math.floor((Date.now() - timestamp.getTime()) / 1000));
    const minutes = Math.floor(seconds / 60);

    if (minutes < 1) {
        return "just now";
    }

    if (minutes < 60) {
        return `${formatTimeUnit(minutes)} ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
};

export const getPresenceMeta = (user) => {
    const onlineFlag = normalizeOnlineState(user?.online);
    const isOnline = onlineFlag && isRecentlyActive(user);

    return {
        isOnline,
        label: isOnline ? "Online" : "Offline",
        lastSeenLabel: isOnline ? "Active now" : formatLastSeen(user?.lastSeen),
        dotClass: isOnline ? "bg-emerald-500" : "bg-slate-500",
    };
};

export const setUserPresence = async (db, uid, online) => {
    if (!uid) return;

    const normalizedOnline = normalizeOnlineState(online);

    await setDoc(
        doc(db, "users", uid),
        {
            online: normalizedOnline,
            lastSeen: serverTimestamp(),
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );
};

export const bindPresenceLifecycle = (db, uid) => {
    if (!uid || !db || typeof window === "undefined" || typeof document === "undefined") {
        return () => { };
    }

    const syncPresence = async (online) => {
        await setUserPresence(db, uid, online);
    };

    const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
            void syncPresence(true);
        } else {
            void syncPresence(false);
        }
    };

    const handleOnline = () => {
        void syncPresence(true);
    };

    const handleOffline = () => {
        void syncPresence(false);
    };

    const handleDisconnect = () => {
        void syncPresence(false);
    };

    void syncPresence(true);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeunload", handleDisconnect);
    window.addEventListener("pagehide", handleDisconnect);

    return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("beforeunload", handleDisconnect);
        window.removeEventListener("pagehide", handleDisconnect);
        void syncPresence(false);
    };
};
