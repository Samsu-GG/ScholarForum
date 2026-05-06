import { useState } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AuthForm from "../components/AuthForm";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  /* --- 1. Profile Update Logic --- */
  const profileFields = [
    { id: "name", label: "Full name", type: "text", placeholder: "Update name" },
    { id: "username", label: "Username", type: "text", placeholder: "Update username" },
  ];

  const validateProfile = ({ name, username }) => {
    const errors = {};
    if (!name || name.length < 2) errors.name = "Full name is too short.";
    if (!username || username.length < 3) errors.username = "Username must be at least 3 characters.";
    return errors;
  };

  const handleUpdateProfile = async (values) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://127.0.0.1:8000/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: values.name,
          user_name: values.username
        }),
      });

      if (response.ok) {
        toast.success("Profile updated!");
        setIsEditing(false);
        await checkAuth();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Update failed");
      }
    } catch (err) {
      toast.error("Network error connecting to backend");
    }
  };

  /* --- 2. Password Change Logic --- */
  const passwordFields = [
    { id: "old_password", label: "Current Password", type: "password", placeholder: "••••••••" },
    { id: "new_password", label: "New Password", type: "password", placeholder: "••••••••" },
    { id: "confirm", label: "Confirm Password", type: "password", placeholder: "••••••••" },
  ];

  const validatePassword = ({ old_password, new_password, confirm }) => {
    const errors = {};
    if (!old_password) errors.old_password = "Current password is required.";
    
    // Reusing your registration logic for strong passwords
    if (!new_password || new_password.length < 8) {
      errors.new_password = "Password must be at least 8 characters.";
    } else if (
      !/[A-Z]/.test(new_password) || 
      !/[a-z]/.test(new_password) || 
      !/[1-9]/.test(new_password) || 
      !/[@,_,.,$,!,%,&,*]/.test(new_password)
    ) {
      errors.new_password = "Password must have a mix of capital, small, number, and special char.";
    }

    if (confirm !== new_password) {
      errors.confirm = "Passwords do not match.";
    }
    return errors;
  };

  const handleChangePassword = async (values) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://127.0.0.1:8000/users/me/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: values.old_password,
          new_password: values.new_password
        }),
      });
        toast.success("Password updated successfully!");
        setIsChangingPassword(false);
} catch (err) {
      const error = await response.json();
      toast.error(error.detail || "Password change failed");
      toast.error("Network error");
    }
  };

  return (
    <div className="page-wrap">
      <div className="back-bar" onClick={() => navigate("/")}>&#8592; Back to Scholar Forum</div>
      <Navbar />
      
      <div className="center-wrap" style={{ background: "#f8f9fa", alignItems: 'flex-start' }}>
        <div className="auth-card" style={{ maxWidth: "600px", marginTop: "2rem" }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="filter-header" style={{ fontSize: '18px', margin: 0 }}>Personal Information</h3>
            <span style={{ fontSize: '11px', background: '#e8eaed', padding: '4px 10px', borderRadius: '12px', fontWeight: '700', color: '#1a2b4a', textTransform: 'uppercase' }}>
              {user?.role || "User"}
            </span>
          </div>

          {!isEditing ? (
            <div className="view-mode">
              <div style={{ marginBottom: '1.2rem' }}>
                <label className="filter-label">Full Name</label>
                <p style={{ fontSize: '15px', color: '#202124', fontWeight: '500' }}>{user?.full_name}</p>
              </div>
              <div style={{ marginBottom: '1.2rem' }}>
                <label className="filter-label">Username</label>
                <p style={{ fontSize: '15px', color: '#202124' }}>@{user?.user_name}</p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="filter-label">Registered Email</label>
                <p style={{ fontSize: '14px', color: '#5f6368' }}>{user?.email}</p>
              </div>
              <button className="outline-btn btn-inline" onClick={() => setIsEditing(true)}>Edit Details</button>
            </div>
          ) : (
            <div>
              <AuthForm 
                fields={profileFields} 
                validate={validateProfile} 
                onSubmit={handleUpdateProfile} 
                submitLabel="Save Changes" 
              />
              <button className="ghost-btn" style={{ marginTop: "-10px" }} onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          )}

          <div className="divider" style={{ margin: '2.5rem 0' }} />

          <h3 className="filter-header" style={{ fontSize: '18px', marginBottom: '1.5rem' }}>Security & Password</h3>

          {!isChangingPassword ? (
            <button className="outline-btn" onClick={() => setIsChangingPassword(true)}>Update Password</button>
          ) : (
            <div>
              <AuthForm 
                fields={passwordFields} 
                validate={validatePassword} 
                onSubmit={handleChangePassword} 
                submitLabel="Change Password" 
              />
              <button className="ghost-btn" style={{ marginTop: "-10px" }} onClick={() => setIsChangingPassword(false)}>Discard</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}