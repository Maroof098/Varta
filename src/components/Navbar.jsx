import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

function Navbar() {
    const logout = async () => {
        await signOut(auth);
    };

    return (
        <div>
            <h2>Varta</h2>
            <button onClick={logout}>Logout</button>
        </div>
    );
}

export default Navbar;