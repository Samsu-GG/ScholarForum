import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";

export default function LoginPage() {
  const navigate  = useNavigate();
  const [success, setSuccess] = useState(false);

  const fields = [
    { id: "email",    label: "Email address", type: "email",    placeholder: "you@example.com" },
    { id: "password", label: "Password",      type: "password", placeholder: "Enter your password" },
  ];

  const validate = ({ email, password }) => {
    const errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email    = "Please enter a valid email address.";
    if (!password || password.length < 8)           errors.password = "Password must be at least 8 characters.";
    return errors;
  };

  // No API call — just show success
  const handleSubmit = (values) => {
    setSuccess(true);
  };

  return (
    <div style={pageWrap}>
      <div style={backBar} onClick={() => navigate("/")}>&#8592; Back to Scholar Forum</div>

      <div style={centerWrap}>
        <div style={card}>
          <Logo />
          <p style={subtitle}>Welcome back! Sign in to continue</p>

          {success ? (
            <>
              <SuccessBanner message="You have successfully signed in! Welcome back." />
              <button style={ghostBtn} onClick={() => navigate("/")}>Back to home</button>
            </>
          ) : (
            <>
              <AuthForm fields={fields} validate={validate} onSubmit={handleSubmit} submitLabel="Sign in" />
              <Divider />
              <p style={footerText}>
                Not registered yet?{" "}
                <span style={link} onClick={() => navigate("/register")}>Register now</span>
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
const card       = { background: "#fff", border: "1px solid #dadce0", borderRadius: "8px", padding: "2rem 2.2rem", width: "100%", maxWidth: "400px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
const subtitle   = { textAlign: "center", fontSize: "13px", color: "#5f6368", marginBottom: "1.6rem" };
const ghostBtn   = { width: "100%", padding: "10px", background: "#f8f9fa", color: "#3c4043", border: "1px solid #dadce0", borderRadius: "4px", fontSize: "14px", cursor: "pointer" };
const footerText = { textAlign: "center", fontSize: "13px", color: "#5f6368" };
const link       = { color: "#4285F4", cursor: "pointer" };