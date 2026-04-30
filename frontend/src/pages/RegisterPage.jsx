import { toast } from "react-toastify";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";

export default function RegisterPage() {
  const navigate  = useNavigate();
  const [success, setSuccess] = useState(false);

  const fields = [
    { id: "name",     label: "Full name",        type: "text",     placeholder: "Jane Doe",              half: true },
    { id: "username", label: "Username",         type: "text",     placeholder: "janedoe",               half: true },
    { id: "email",    label: "Email address",    type: "email",    placeholder: "you@example.com" },
    { id: "password", label: "Password",         type: "password", placeholder: "At least 8 characters" },
    { id: "confirm",  label: "Confirm password", type: "password", placeholder: "Repeat your password" },
    { id: "role",     label: "role",             type: "radio",    options: ["Author", "User", "Admin"]},
  ];

  const validate = ({ name, username, email, password, confirm, role }) => {
    const errors = {};
    if (!name)                                          errors.name     = "Name is required.";
    if (!username)                                      errors.username = "Username is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))      errors.email    = "Enter a valid email address.";
    if (!password || password.length < 8)               errors.password = "Password must be at least 8 characters.";
    else if(!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[@,_,.,$,!,%,&,*]/.test(password) || !/[1-9]/.test(password))
                                                        errors.password = "Password must have mix of capital and small letters, a number, and @ or _";
    if (!confirm || confirm !== password)               errors.confirm  = "Passwords do not match.";
    if(!role)                                           errors.role     = "Must select a Role";
    return errors;
  };

  const handleSubmit = async (values) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/auth/register`, {
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
    <div className="page-wrap">
      <div className="back-bar" onClick={() => navigate("/login")}>&#8592; Already have an account? Sign in</div>

      <div className="center-wrap">
        <div className="auth-card">
          <Logo />
          <p className="auth-subtitle">Create your account</p>

          {success ? (
            <>
              <SuccessBanner message="Account created successfully! You can now sign in." />
              <button className="primary-btn" onClick={() => navigate("/login")}>Sign in now</button>
            </>
          ) : (
            <>
              <AuthForm fields={fields} validate={validate} onSubmit={handleSubmit} submitLabel="Create account" />
              <Divider />
              <p className="footer-text">
                Already registered?{" "}
                <span className="link" onClick={() => navigate("/login")}>Sign in</span>
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