import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900">
            <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Varta</p>
                <h1 className="mt-3 text-3xl font-semibold">A simple place for chat and collaboration.</h1>
                <p className="mt-3 text-slate-600">Sign in to continue to your workspace.</p>

                <div className="mt-6 flex flex-wrap gap-3">
                    <button type="button" onClick={() => navigate("/register")} className="rounded-lg bg-blue-600 px-4 py-2 text-white">
                        Create account
                    </button>
                    <button type="button" onClick={() => navigate("/login")} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700">
                        Sign in
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Home;