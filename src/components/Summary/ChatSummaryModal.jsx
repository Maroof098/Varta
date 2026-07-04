import { useMemo, useState } from 'react';
import { summarizeMessages } from '../../services/aiService';

function ChatSummaryModal({ messages, onClose }) {
    const [openSection, setOpenSection] = useState('summary');
    const summaryData = useMemo(() => summarizeMessages(messages || []), [messages]);

    const sections = [
        { key: 'summary', title: 'Summary', items: summaryData.summary ? [summaryData.summary] : [] },
        { key: 'points', title: 'Important Points', items: summaryData.importantPoints },
        { key: 'actions', title: 'Action Items', items: summaryData.actionItems },
        { key: 'questions', title: 'Questions', items: summaryData.questions },
    ];

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Summarize Chat</h3>
                        <p className="text-sm text-slate-500">Generated locally for this conversation.</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm dark:bg-slate-800">
                        Close
                    </button>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                    {sections.map((section) => (
                        <button key={section.key} type="button" onClick={() => setOpenSection(section.key)} className={`rounded-full px-3 py-1.5 text-sm ${openSection === section.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
                            {section.title}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    {sections.filter((section) => section.key === openSection).map((section) => (
                        <div key={section.key}>
                            {section.items.length ? (
                                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                                    {section.items.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-500">No entries yet.</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ChatSummaryModal;
