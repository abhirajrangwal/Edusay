import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Student = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  course: string | null;
  year: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
};

function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    course: "",
    year: "",
    guardian_name: "",
    guardian_phone: "",
  });

  const loadStudents = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, phone, course, year, guardian_name, guardian_phone"
      )
      .eq("role", "student")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setStudents((data as Student[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    const { error } = await supabase.from("profiles").insert({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      course: form.course.trim() || null,

      // Year is now stored as TEXT
      year: form.year.trim() || null,

      guardian_name: form.guardian_name.trim() || null,
      guardian_phone: form.guardian_phone.trim() || null,
      role: "student",
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setForm({
      full_name: "",
      email: "",
      phone: "",
      course: "",
      year: "",
      guardian_name: "",
      guardian_phone: "",
    });

    await loadStudents();

    setSaving(false);
  };

  const deleteStudent = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this student?"
    );

    if (!confirmed) return;

    setError("");

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadStudents();
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Students</h1>

      <p>Manage EduStay students.</p>

      {error && (
        <div
          style={{
            padding: "12px",
            margin: "15px 0",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "8px",
          }}
        >
          {error}
        </div>
      )}

      {/* Add Student */}
      <div
        style={{
          marginTop: "25px",
          padding: "25px",
          border: "1px solid #ddd",
          borderRadius: "12px",
        }}
      >
        <h2>Add Student</h2>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <input
            placeholder="Full name"
            value={form.full_name}
            onChange={(e) =>
              setForm({
                ...form,
                full_name: e.target.value,
              })
            }
            required
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            required
          />

          {/* Phone */}
          <input
            type="text"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
          />

          {/* Course */}
          <input
            type="text"
            placeholder="Course"
            value={form.course}
            onChange={(e) =>
              setForm({
                ...form,
                course: e.target.value,
              })
            }
          />

          {/* Year - TEXT instead of NUMBER */}
          <input
            type="text"
            placeholder="Year (e.g. 1st Year)"
            value={form.year}
            onChange={(e) =>
              setForm({
                ...form,
                year: e.target.value,
              })
            }
          />

          {/* Guardian Name */}
          <input
            type="text"
            placeholder="Guardian name"
            value={form.guardian_name}
            onChange={(e) =>
              setForm({
                ...form,
                guardian_name: e.target.value,
              })
            }
          />

          {/* Guardian Phone */}
          <input
            type="text"
            placeholder="Guardian phone"
            value={form.guardian_phone}
            onChange={(e) =>
              setForm({
                ...form,
                guardian_phone: e.target.value,
              })
            }
          />

          {/* Submit */}
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Add Student"}
          </button>
        </form>
      </div>

      {/* Students List */}
      <div style={{ marginTop: "30px" }}>
        <h2>Students List</h2>

        {loading ? (
          <p>Loading students...</p>
        ) : students.length === 0 ? (
          <p>No students found.</p>
        ) : (
          <div>
            {students.map((student) => (
              <div
                key={student.id}
                style={{
                  padding: "20px",
                  marginBottom: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                }}
              >
                <h3>{student.full_name}</h3>

                <p>{student.email}</p>

                <p>
                  {student.course || "Course not set"}

                  {student.year
                    ? ` • Year ${student.year}`
                    : ""}
                </p>

                {student.phone && (
                  <p>Phone: {student.phone}</p>
                )}

                {student.guardian_name && (
                  <p>
                    Guardian: {student.guardian_name}

                    {student.guardian_phone
                      ? ` (${student.guardian_phone})`
                      : ""}
                  </p>
                )}

                <button
                  onClick={() => deleteStudent(student.id)}
                >
                  Remove Student
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Students;