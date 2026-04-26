import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";

export default function RegisterPage() {
  const navigate  = useNavigate();
  const [success, setSuccess] = useState(false);

  const fields = [
    { id: "name",     label: "Full name",       type: "text",     placeholder: "Jane Doe",              half: true },
    { id: "username", label: "Username",         type: "text",     placeholder: "janedoe",               half: true },
    { id: "email",    label: "Email address",    type: "email",    placeholder: "you@example.com" },
    { id: "password", label: "Password",         type: "password", placeholder: "At least 8 characters" },
    { id: "confirm",  label: "Confirm password", type: "password", placeholder: "Repeat your password" },
    {id: "role", label: "role", type: "radio",      options: ["Author", "User", "Admin"]},
  ];

  const validate = ({ name, username, email, password, confirm,role}) => {
    const errors = {};
    if (!name)                                          errors.name     = "Name is required.";
    if (!username)                                      errors.username = "Username is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))     errors.email    = "Enter a valid email address.";
    if (!password || password.length < 8)               errors.password = "Password must be at least 8 characters.";
    else if(!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[@,_]/.test(password) || !/[1-9]/.test(password))  errors.password ="Password must have mix of capital letter and small letter"
    if (!confirm || confirm !== password)               errors.confirm  = "Passwords do not match.";
    if(!role)                                           errors.role  = "Must select a Role";
    return errors;
  };

  // No API call — just show success
//   const handleSubmit = (values) => {
//     setSuccess(true);
//   };
const handleSubmit = async (values) => {
  try {
    const response = await fetch(` http://localhost:5174//register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: values.name,
        user_name: values.username,
        email: values.email,
        password: values.password,
        role: values.role,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(true);
      toast.success("Account Created Successfully!");
      setTimeout(() => navigate("/login"), 1200);
    } else {
      toast.error(data.detail || "Registration failed");
    }
  } catch (error) {
    toast.error("Something went wrong");
    console.error(error);
  }
};

  return (
    <div style={pageWrap}>
      <div style={backBar} onClick={() => navigate("/login")}>&#8592; Already have an account? Sign in</div>

      <div style={centerWrap}>
        <div style={card}>
          <Logo />
          <p style={subtitle}>Create your account</p>

          {success ? (
            <>
              <SuccessBanner message="Account created successfully! You can now sign in." />
              <button style={primaryBtn} onClick={() => navigate("/login")}>Sign in now</button>
            </>
          ) : (
            <>
              <AuthForm fields={fields} validate={validate} onSubmit={handleSubmit} submitLabel="Create account" />
              <Divider />
              <p style={footerText}>
                Already registered?{" "}
                <span style={link} onClick={() => navigate("/login")}>Sign in</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── shared sub-components ── */
function Logo() {
  return (
    <div style={{ fontSize: "22px", fontWeight: 400, textAlign: "center", marginBottom: "4px" }}>
      <span style={{ color: "#4285F4" }}>S</span><span style={{ color: "#EA4335" }}>c</span>
      <span style={{ color: "#FBBC05" }}>h</span><span style={{ color: "#4285F4" }}>o</span>
      <span style={{ color: "#34A853" }}>l</span><span style={{ color: "#EA4335" }}>a</span>
      <span style={{ color: "#4285F4" }}>r</span>{" "}
      <span style={{ color: "#FBBC05" }}>F</span><span style={{ color: "#34A853" }}>o</span>
      <span style={{ color: "#EA4335" }}>r</span><span style={{ color: "#4285F4" }}>u</span>
      <span style={{ color: "#EA4335" }}>m</span>
    </div>
  );
}

function SuccessBanner({ message }) {
  return (
    <div style={{ background: "#e6f4ea", border: "1px solid #a8d5b5", borderRadius: "6px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
      <span style={{ width: "22px", height: "22px", background: "#34A853", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", flexShrink: 0 }}>✓</span>
      <span style={{ fontSize: "14px", color: "#137333", fontWeight: 500 }}>{message}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: "#e8eaed", margin: "1.2rem 0" }} />;
}

/* ── styles ── */
const pageWrap   = { display: "flex", flexDirection: "column", minHeight: "100vh" };
const backBar    = { padding: "14px 20px", fontSize: "13px", color: "#5f6368", cursor: "pointer", borderBottom: "1px solid #e8eaed", background: "#fff" };
const centerWrap = { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", background: "#f8f9fa" };
const card       = { background: "#fff", border: "1px solid #dadce0", borderRadius: "8px", padding: "2rem 2.2rem", width: "100%", maxWidth: "420px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
const subtitle   = { textAlign: "center", fontSize: "13px", color: "#5f6368", marginBottom: "1.6rem" };
const primaryBtn = { width: "100%", padding: "10px", background: "#4285F4", color: "#fff", border: "none", borderRadius: "4px", fontSize: "15px", cursor: "pointer", marginTop: "8px" };
const footerText = { textAlign: "center", fontSize: "13px", color: "#5f6368" };
const link       = { color: "#4285F4", cursor: "pointer" };