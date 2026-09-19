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
  const [googleLoading, setGoogleLoading] = useState(false);

  // =========================================================
  // NORMAL STUDENT LOGIN
  // =========================================================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Clear previous session
      await supabase.auth.signOut();

      // Login with email/password
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      // Invalid login
      if (loginError || !data.user) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      // Get student profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      // Profile missing
      if (profileError || !profile) {
        await supabase.auth.signOut();

        setError(
          "Your account profile has not been configured. Please complete student registration first."
        );

        setLoading(false);
        return;
      }

      // Only students can use this login
      if (profile.role !== "student") {
        await supabase.auth.signOut();

        setError(
          "This account is not a student account. Please use Admin Login."
        );

        setLoading(false);
        return;
      }

      // Successful student login
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      setError("Something went wrong while signing in.");
    }

    setLoading(false);
  };

  // =========================================================
  // GOOGLE LOGIN
  // =========================================================
  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      const { error: googleError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            // IMPORTANT:
            // Google authentication finishes at Supabase,
            // then Supabase sends the user to the student
            // information page instead of directly to dashboard.
            redirectTo: `${window.location.origin}/signup`,
          },
        });

      if (googleError) {
        console.error("Google login error:", googleError);

        setError(googleError.message);
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error("Google login error:", err);

      setError("Unable to connect to Google. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">

        {/* Back */}
        <Link to="/" className="auth-back">
          ← Back to EduStay
        </Link>

        {/* Brand */}
        <div className="auth-brand">
          EduStay<span>.</span>
        </div>

        <p className="auth-label">STUDENT PORTAL</p>

        <h1>Welcome back.</h1>

        <p className="auth-description">
          Sign in to manage your room, complaints and hostel fees.
        </p>

        {/* =====================================================
            EMAIL / PASSWORD LOGIN
        ====================================================== */}
        <form onSubmit={handleSubmit} className="auth-form">

          {/* Email */}
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
                disabled={loading || googleLoading}
              />
            </div>
          </label>

          {/* Password */}
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
                disabled={loading || googleLoading}
              />
            </div>
          </label>

          {/* Error */}
          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          {/* Sign In */}
          <button
            type="submit"
            className="auth-submit"
            disabled={loading || googleLoading}
          >
            {loading ? "Signing in..." : "Sign In"}

            {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        {/* =====================================================
            OR
        ====================================================== */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "22px 0",
            color: "#64748b",
            fontSize: "12px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#243047",
            }}
          />

          OR

          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#243047",
            }}
          />
        </div>

        {/* =====================================================
            GOOGLE LOGIN
        ====================================================== */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "#ffffff",
            color: "#111827",
            fontSize: "14px",
            fontWeight: 600,
            cursor:
              googleLoading || loading
                ? "not-allowed"
                : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            opacity:
              googleLoading || loading
                ? 0.7
                : 1,
          }}
        >
          {/* Google G */}
          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            G
          </span>

          {googleLoading
            ? "Connecting to Google..."
            : "Continue with Google"}
        </button>

        {/* =====================================================
            ADMIN LOGIN
        ====================================================== */}
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