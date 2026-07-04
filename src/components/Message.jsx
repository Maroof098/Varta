function Message({ msg }) {
    return (
        <div className="mt-1 text-xs text-gray-300">
            {msg?.timestamp?.toDate?.().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })}
        </div>
    );
}

export default Message;