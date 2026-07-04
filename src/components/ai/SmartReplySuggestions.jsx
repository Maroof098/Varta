function SmartReplySuggestions({ suggestions, onSelect }) {
    if (!suggestions?.length) return null;

    return (
        <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
                <button
                    key={suggestion}
                    type="button"
                    onClick={() => onSelect?.(suggestion)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                    {suggestion}
                </button>
            ))}
        </div>
    );
}

export default SmartReplySuggestions;
