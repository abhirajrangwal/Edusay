import {
  FormEvent,
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Signup() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [userId, setUserId] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");

  // =========================================================
  // LOAD GOOGLE USER
  // =========================================================
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Get user error:", userError);
        }

        // No logged-in user
        if (!user) {
          navigate("/login", { replace: true });
          return;
        }

        setUserId(user.id);

        // =====================================================
        // GOOGLE ACCOUNT INFORMATION
        // =====================================================
        const googleName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "";

        const googleEmail = user.email || "";

        setFullName(googleName);
        setEmail(googleEmail);

        // =====================================================
        // CHECK EXISTING REGISTRATION REQUEST
        // =====================================================
        const {
          data: existingRequest,
          error: requestError,
        } = await supabase
          .from("student_requests")
          .select(
            "id, status, full_name, email, phone, course, year, guardian_name, guardian_phone"
          )
          .eq("auth_user_id", user.id)
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (requestError) {
          console.error("Request check error:", requestError);
        }

        // =====================================================
        // REQUEST APPROVED
        // =====================================================
        if (existingRequest?.status === "approved") {
          navigate("/dashboard", { replace: true });
          return;
        }

        // =====================================================
        // REQUEST PENDING
        // =====================================================
        if (existingRequest?.status === "pending") {
          // Load the submitted information so it can be displayed
          setFullName(existingRequest.full_name || googleName);
          setEmail(existingRequest.email || googleEmail);
          setPhone(existingRequest.phone || "");
          setCourse(existingRequest.course || "");
          setYear(
            existingRequest.year
              ? String(existingRequest.year)
              : ""
          );
          setGuardianName(existingRequest.guardian_name || "");
          setGuardianPhone(existingRequest.guardian_phone || "");

          setSubmitted(true);
          setLoading(false);
          return;
        }

        // =====================================================
        // REQUEST REJECTED
        // =====================================================
        if (existingRequest?.status === "rejected") {
          // Allow the student to submit again.
          setFullName(existingRequest.full_name || googleName);
          setEmail(existingRequest.email || googleEmail);
          setPhone(existingRequest.phone || "");
          setCourse(existingRequest.course || "");
          setYear(
            existingRequest.year
              ? String(existingRequest.year)
              : ""
          );
          setGuardianName(existingRequest.guardian_name || "");
          setGuardianPhone(existingRequest.guardian_phone || "");

          setSubmitted(false);
          setLoading(false);
          return;
        }

        // =====================================================
        // CHECK EXISTING PROFILE
        //
        // IMPORTANT:
        // We DO NOT redirect to dashboard just because a profile
        // exists.
        //
        // A Google account may already have a profile row created
        // automatically. The student still needs to complete
        // registration and get admin approval.
        // =====================================================
        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select(
              "id, full_name, email, phone, course, year, guardian_name, guardian_phone, role"
            )
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) {
          console.error("Profile check error:", profileError);
        }

        // If profile exists, use its information to pre-fill the
        // registration form.
        if (profile) {
          setFullName(
            profile.full_name ||
              googleName ||
              ""
          );

          setEmail(
            profile.email ||
              googleEmail ||
              ""
          );

          setPhone(profile.phone || "");
          setCourse(profile.course || "");

          setYear(
            profile.year
              ? String(profile.year)
              : ""
          );

          setGuardianName(
            profile.guardian_name || ""
          );

          setGuardianPhone(
            profile.guardian_phone || ""
          );
        }

        // =====================================================
        // VERY IMPORTANT:
        //
        // DO NOT DO THIS:
        //
        // if (profile?.role === "student") {
        //   navigate("/dashboard");
        // }
        //
        // The admin approval request controls access.
        // =====================================================

        setLoading(false);
      } catch (err) {
        console.error("Signup loading error:", err);

        setError(
          "Unable to load your account. Please try again."
        );

        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  // =========================================================
  // SUBMIT REGISTRATION REQUEST
  // =========================================================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");

    // Validate full name
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    // Validate phone
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    // Validate course
    if (!course.trim()) {
      setError("Please enter your course.");
      return;
    }

    // Validate year
    if (!year.trim()) {
      setError("Please enter your year.");
      return;
    }

    // Validate guardian name
    if (!guardianName.trim()) {
      setError("Please enter your guardian name.");
      return;
    }

    // Validate guardian phone
    if (!guardianPhone.trim()) {
      setError("Please enter your guardian phone number.");
      return;
    }

    const yearNumber = Number(year);

    if (!Number.isInteger(yearNumber) || yearNumber <= 0) {
      setError("Please enter a valid year.");
      return;
    }

    if (!userId) {
      setError(
        "Your Google account session was not found. Please sign in again."
      );
      return;
    }

    setSubmitting(true);

    try {
      // =====================================================
      // CHECK FOR EXISTING REQUEST
      // =====================================================
      const {
        data: existingRequest,
        error: checkError,
      } = await supabase
        .from("student_requests")
        .select("id, status")
        .eq("auth_user_id", userId)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (checkError) {
        console.error(
          "Existing request check error:",
          checkError
        );
      }

      // Already approved
      if (existingRequest?.status === "approved") {
        setSubmitting(false);

        navigate("/dashboard", {
          replace: true,
        });

        return;
      }

      // Already pending
      if (existingRequest?.status === "pending") {
        setSubmitting(false);
        setSubmitted(true);
        return;
      }

      // =====================================================
      // REJECTED REQUEST
      //
      // Instead of creating another request, update the
      // rejected request and send it back to pending.
      // =====================================================
      if (existingRequest?.status === "rejected") {
        const { error: updateError } =
          await supabase
            .from("student_requests")
            .update({
              full_name: fullName.trim(),
              email: email.trim(),
              phone: phone.trim(),
              course: course.trim(),
              year: yearNumber,
              guardian_name: guardianName.trim(),
              guardian_phone: guardianPhone.trim(),
              status: "pending",
            })
            .eq("id", existingRequest.id);

        if (updateError) {
          console.error(
            "Request update error:",
            updateError
          );

          setError(updateError.message);
          setSubmitting(false);
          return;
        }

        setSubmitted(true);
        setSubmitting(false);

        return;
      }

      // =====================================================
      // NEW REGISTRATION REQUEST
      // =====================================================
      const { error: insertError } =
        await supabase
          .from("student_requests")
          .insert({
            auth_user_id: userId,
            full_name: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            course: course.trim(),
            year: yearNumber,
            guardian_name: guardianName.trim(),
            guardian_phone: guardianPhone.trim(),
            status: "pending",
          });

      if (insertError) {
        console.error(
          "Registration insert error:",
          insertError
        );

        // Duplicate request
        if (insertError.code === "23505") {
          setError(
            "You already have a registration request."
          );
        } else {
          setError(insertError.message);
        }

        setSubmitting(false);
        return;
      }

      // Registration successfully submitted
      setSubmitted(true);
      setSubmitting(false);
    } catch (err) {
      console.error(
        "Registration submission error:",
        err
      );

      setError(
        "Something went wrong while submitting your registration."
      );

      setSubmitting(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================
  const handleLogout = async () => {
    await supabase.auth.signOut();

    navigate("/login", {
      replace: true,
    });
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================
  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <div style={styles.brand}>
            EduStay<span>.</span>
          </div>

          <p style={styles.loadingText}>
            Loading your Google account...
          </p>
        </div>
      </main>
    );
  }

  // =========================================================
  // PENDING APPROVAL SCREEN
  // =========================================================
  if (submitted) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <div style={styles.brand}>
            EduStay<span>.</span>
          </div>

          <div style={styles.iconCircle}>
            ✓
          </div>

          <h1 style={styles.title}>
            Request Submitted
          </h1>

          <p style={styles.description}>
            Your student registration request has
            been sent to the administrator.
          </p>

          <div style={styles.pendingBox}>
            <strong>
              Waiting for Admin Approval
            </strong>

            <p style={styles.pendingText}>
              Your account will be activated after
              the administrator approves your
              request.
            </p>

            <p style={styles.pendingText}>
              You can sign out now. Once your
              registration is approved, you can
              sign in again to access the student
              dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={styles.secondaryButton}
          >
            Sign Out
          </button>
        </div>
      </main>
    );
  }

  // =========================================================
  // REGISTRATION FORM
  // =========================================================
  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>
          EduStay<span>.</span>
        </div>

        <p style={styles.label}>
          STUDENT REGISTRATION
        </p>

        <h1 style={styles.title}>
          Complete your profile.
        </h1>

        <p style={styles.description}>
          Your Google account is connected.
          Complete your student information and
          send a registration request to the admin.
        </p>

        {/* =================================================
            REGISTRATION FORM
        ================================================== */}
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <label style={styles.labelField}>
            Full Name

            <input
              type="text"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              placeholder="Enter your full name"
              style={styles.input}
              required
            />
          </label>

          {/* Email */}
          <label style={styles.labelField}>
            Email

            <input
              type="email"
              value={email}
              readOnly
              style={{
                ...styles.input,
                background: "#111827",
                color: "#94a3b8",
                cursor: "not-allowed",
              }}
            />
          </label>

          {/* Phone */}
          <label style={styles.labelField}>
            Phone Number

            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              placeholder="Enter phone number"
              style={styles.input}
              required
            />
          </label>

          {/* Course */}
          <label style={styles.labelField}>
            Course

            <input
              type="text"
              value={course}
              onChange={(e) =>
                setCourse(e.target.value)
              }
              placeholder="e.g. B.Tech Computer Science"
              style={styles.input}
              required
            />
          </label>

          {/* Year */}
          <label style={styles.labelField}>
            Year

            <input
              type="number"
              min="1"
              value={year}
              onChange={(e) =>
                setYear(e.target.value)
              }
              placeholder="e.g. 2"
              style={styles.input}
              required
            />
          </label>

          {/* Guardian Name */}
          <label style={styles.labelField}>
            Guardian Name

            <input
              type="text"
              value={guardianName}
              onChange={(e) =>
                setGuardianName(e.target.value)
              }
              placeholder="Enter guardian name"
              style={styles.input}
              required
            />
          </label>

          {/* Guardian Phone */}
          <label style={styles.labelField}>
            Guardian Phone

            <input
              type="tel"
              value={guardianPhone}
              onChange={(e) =>
                setGuardianPhone(e.target.value)
              }
              placeholder="Enter guardian phone"
              style={styles.input}
              required
            />
          </label>

          {/* Error */}
          {error && (
            <p style={styles.error}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.submitButton,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting
                ? "not-allowed"
                : "pointer",
            }}
          >
            {submitting
              ? "Submitting Request..."
              : "Send Registration Request"}
          </button>
        </form>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          Cancel & Sign Out
        </button>
      </div>
    </main>
  );
}

// ===========================================================
// STYLES
// ===========================================================

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#050816",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
  },

  card: {
    width: "100%",
    maxWidth: "520px",
    background: "#0b1120",
    border: "1px solid #172033",
    borderRadius: "18px",
    padding: "35px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  },

  brand: {
    fontSize: "25px",
    fontWeight: 800,
    marginBottom: "24px",
  },

  label: {
    color: "#3b82f6",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "1.5px",
    marginBottom: "10px",
  },

  title: {
    fontSize: "28px",
    margin: "0 0 10px",
  },

  description: {
    color: "#94a3b8",
    fontSize: "14px",
    lineHeight: 1.6,
    marginBottom: "25px",
  },

  loadingText: {
    color: "#94a3b8",
    fontSize: "14px",
  },

  labelField: {
    display: "block",
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "16px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    marginTop: "7px",
    padding: "12px 14px",
    borderRadius: "9px",
    border: "1px solid #26344d",
    background: "#050816",
    color: "#ffffff",
    outline: "none",
    fontSize: "14px",
  },

  submitButton: {
    width: "100%",
    border: "none",
    borderRadius: "9px",
    padding: "13px 16px",
    background: "#3b82f6",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 700,
    marginTop: "5px",
  },

  error: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#f87171",
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "15px",
  },

  iconCircle: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: "rgba(34,197,94,0.15)",
    color: "#22c55e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: 700,
    marginBottom: "20px",
  },

  pendingBox: {
    background: "#111827",
    border: "1px solid #26344d",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "20px",
    color: "#e2e8f0",
    fontSize: "14px",
  },

  pendingText: {
    color: "#94a3b8",
    lineHeight: 1.6,
    marginTop: "10px",
    marginBottom: 0,
  },

  secondaryButton: {
    width: "100%",
    padding: "12px",
    borderRadius: "9px",
    border: "1px solid #334155",
    background: "transparent",
    color: "#cbd5e1",
    cursor: "pointer",
    fontSize: "14px",
  },

  logoutButton: {
    width: "100%",
    marginTop: "15px",
    padding: "10px",
    border: "none",
    background: "transparent",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "13px",
  },
};

export default Signup;