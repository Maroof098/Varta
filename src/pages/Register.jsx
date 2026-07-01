import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { auth, db } from "../firebase/firebase";
import vartaLogo from "../assets/hero.png";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            await setDoc(doc(db, "users", userCredential.user.uid), {
                uid: userCredential.user.uid,
                email,
                displayName: name.trim() || email.split("@")[0],
                online: true,
                lastSeen: serverTimestamp(),
                createdAt: serverTimestamp(),
            });

            navigate("/dashboard");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-6 sm:py-10">
            <form onSubmit={handleRegister} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-4 flex items-center gap-3">
                    <img src={vartaLogo} alt="Varta logo" className="h-11 w-11 rounded-xl object-cover" />
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
                        <p className="mt-1 text-sm text-slate-500">Join Varta to start chatting.</p>
                    </div>
                </div>

                <label className="mt-6 mb-2 block text-sm text-slate-700">Name</label>
                <div className="flex items-center rounded-lg border border-slate-300 px-3">
                    <User size={16} className="mr-2 text-slate-400" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent py-3 outline-none" placeholder="Alex" />
                </div>

                <label className="mt-4 mb-2 block text-sm text-slate-700">Email</label>
                <div className="flex items-center rounded-lg border border-slate-300 px-3">
                    <Mail size={16} className="mr-2 text-slate-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent py-3 outline-none" placeholder="name@example.com" />
                </div>

                <label className="mt-4 mb-2 block text-sm text-slate-700">Password</label>
                <div className="flex items-center rounded-lg border border-slate-300 px-3">
                    <Lock size={16} className="mr-2 text-slate-400" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent py-3 outline-none" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="ml-2 text-slate-400">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>

                <button type="submit" className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-medium text-white">
                    Create account
                </button>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account? <Link to="/login" className="text-blue-600">Sign in</Link>
                </p>
            </form>
        </div>
    );
}

export default Register;