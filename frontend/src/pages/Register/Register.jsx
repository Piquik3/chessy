import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    async function register(e) {
        e.preventDefault();

        if (!username.trim()) {
            return alert("Username is required.");
        }

        if (password.length < 6) {
            return alert("Password must contain at least 6 characters.");
        }

        if (password !== confirmPassword) {
            return alert("Passwords do not match.");
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const json = await res.json();

            if (!res.ok) {
                return alert(json.error);
            }

            alert("Account created successfully!");

            navigate("/login");

        } catch (err) {
            alert(err.message);
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">

                <h1>♟ Chessy</h1>
                <h2>Create an account</h2>

                <form onSubmit={register}>

                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <button type="submit">
                        Create account
                    </button>

                </form>

                <p>
                    Already have an account?{" "}
                    <Link to="/login">
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default Register;