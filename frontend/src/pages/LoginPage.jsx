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
    <div className="page-wrap">
      <div className="back-bar" onClick={() => navigate("/")}>&#8592; Back to Scholar Forum</div>

      <div className="center-wrap">
        <div className="auth-card">
          <Logo />
          <p className="auth-subtitle">Welcome back! Sign in to continue</p>

          {success ? (
            <>
              <SuccessBanner message="You have successfully signed in! Welcome back." />
              <button className="ghost-btn" onClick={() => navigate("/")}>Back to home</button>
            </>
          ) : (
            <>
              <AuthForm fields={fields} validate={validate} onSubmit={handleSubmit} submitLabel="Sign in" />
              <Divider />
              <p className="footer-text">
                Not registered yet?{" "}
                <span className="link" onClick={() => navigate("/register")}>Register now</span>
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
    <div className="logo-text">
      <span className="text-blue">S</span><span className="text-red">c</span>
      <span className="text-yellow">h</span><span className="text-blue">o</span>
      <span className="text-green">l</span><span className="text-red">a</span>
      <span className="text-blue">r</span>{" "}
      <span className="text-yellow">F</span><span className="text-green">o</span>
      <span className="text-red">r</span><span className="text-blue">u</span>
      <span className="text-red">m</span>
    </div>
  );
}

function SuccessBanner({ message }) {
  return (
    <div className="success-banner">
      <span className="success-icon">✓</span>
      <span className="success-text">{message}</span>
    </div>
  );
}

function Divider() {
  return <div className="divider" />;
}