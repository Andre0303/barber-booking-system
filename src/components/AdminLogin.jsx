import { useState } from "react";

function AdminLogin({ onLogin }) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e) => {

        e.preventDefault();

        // Temporary login details
        if (username === "admin" && password === "admin123") {

            console.log("Login successful");

            // Send the logged-in user back to App.jsx
            onLogin({
                username: username,
                role: "admin"
            });

        } else {

            setError("Incorrect username or password");

        }
    };


    return (

        <div className="admin-login-container">

            <div className="admin-login-card">

                <div className="admin-login-header">

                    <div className="login-logo">
                        ELITE <span>CUTS</span>
                    </div>

                    <h2>Admin Login</h2>

                    <p>
                        Manage your barber bookings
                    </p>

                </div>


                <form onSubmit={handleLogin}>

                    <div className="form-group">

                        <label>
                            Username
                        </label>

                        <input
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            placeholder="Enter username"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter password"
                            required
                        />

                    </div>


                    {error && (

                        <div className="login-error">
                            {error}
                        </div>

                    )}


                    <button
                        type="submit"
                        className="login-btn"
                    >
                        Login
                    </button>

                </form>


                <div className="demo-login">

                    <strong>Demo Login</strong>

                    <p>
                        Username: admin
                    </p>

                    <p>
                        Password: admin123
                    </p>

                </div>

            </div>

        </div>

    );
}

export default AdminLogin;