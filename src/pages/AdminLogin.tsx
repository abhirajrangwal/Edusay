import { FormEvent, useState } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/Login.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    // Remove any previous session
    await supabase.auth.signOut();

    // Login through Supabase
    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    // Wrong credentials
    if (loginError || !data.user) {
      setError("Invalid admin email or password.");
      setLoading(false);
      return;
    }

    // Find the user's profile and role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    // Profile missing
    if (profileError || !profile) {
      await supabase.auth.signOut();

      setError("Admin profile has not been configured.");
      setLoading(false);
      return;
    }

    // Make sure this is actually an admin
    if (profile.role !== "admin") {
      await supabase.auth.signOut();

      setError("This account is not an admin account.");
      setLoading(false);
      return;
    }

    // Successful admin login
    navigate("/admin");

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

        <p className="auth-label">ADMIN PORTAL</p>

        <h1>Admin Login</h1>

        <p className="auth-description">
          Sign in to manage students, rooms, complaints and hostel fees.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">

          <label>
            Email

            <div className="input-wrap">
              <Mail size={17} />

              <input
                type="email"
                placeholder="admin@example.com"
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
            {loading ? "Signing in..." : "Admin Login"}
            {!loading && <ArrowRight size={17} />}
          </button>

        </form>

        <Link
          to="/login"
          style={{
            display: "block",
            marginTop: "20px",
            textAlign: "center",
            color: "#3b82f6",
            textDecoration: "none",
            fontSize: "13px",
          }}
        >
          Student Login →
        </Link>

      </div>
    </main>
  );
}

export default AdminLogin;