import { FormEvent, useState } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    // Clear any previous session
    await supabase.auth.signOut();

    // Authenticate with Supabase
    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    // Wrong email/password
    if (loginError || !data.user) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    // Profile doesn't exist
    if (profileError || !profile) {
      await supabase.auth.signOut();

      setError("Your account profile has not been configured.");
      setLoading(false);
      return;
    }

    // This is the STUDENT login.
    // Admin accounts should use Admin Login.
    if (profile.role !== "student") {
      await supabase.auth.signOut();

      setError("This account is not a student account. Please use Admin Login.");
      setLoading(false);
      return;
    }

    // Successful student login
    navigate("/dashboard");

    setLoading(false);
  };

  return (
    <main className="auth-page">
      <div className="auth-card">

        <Link to="/" className="auth-back">
          ← Back to EduStay
        </Link>

        <div className="auth-brand">
          EduStay<span>.</span>
        </div>

        <p className="auth-label">STUDENT PORTAL</p>

        <h1>Welcome back.</h1>

        <p className="auth-description">
          Sign in to manage your room, complaints and hostel fees.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">

          <label>
            Email

            <div className="input-wrap">
              <Mail size={17} />

              <input
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>

          <label>
            Password

            <div className="input-wrap">
              <Lock size={17} />

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </label>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight size={17} />}
          </button>

        </form>

        <Link
          to="/admin-login"
          style={{
            display: "block",
            marginTop: "20px",
            textAlign: "center",
            color: "#3b82f6",
            textDecoration: "none",
            fontSize: "13px",
          }}
        >
          Admin Login →
        </Link>

      </div>
    </main>
  );
}

export default Login;