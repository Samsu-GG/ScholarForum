import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const navigate  = useNavigate();
  const { user, checkAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [formData, setFormData] = useState({ full_name: "", user_name: "" });
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        user_name: user.user_name || ""
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://127.0.0.1:8000/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      return toast.error("New passwords do not match");
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://127.0.0.1:8000/users/me/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: passwordData.old_password,
          new_password: passwordData.new_password
        }),
      });

      if (response.ok) {
        toast.success("Password updated successfully!");
        setIsChangingPassword(false);
        setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
      } else {
        const error = await response.json();
        toast.error(error.detail || "Password change failed");
      }
    } catch (err) {
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
            <h3 className="filter-header" style={{ fontSize: '18px', margin: 0 }}>
              Personal Information
            </h3>
            {/* Displaying the Role as a subtle badge */}
            <span style={{ 
              fontSize: '11px', 
              background: '#e8eaed', 
              padding: '4px 10px', 
              borderRadius: '12px', 
              fontWeight: '700', 
              color: '#1a2b4a',
              textTransform: 'uppercase' 
            }}>
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
              <button className="outline-btn btn-inline" onClick={() => setIsEditing(true)}>
                Edit Details
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile}>
              <div className="filter-group">
                <label className="filter-label">Full Name</label>
                <input className="auth-input" style={{ border: '1px solid #dadce0' }} value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} placeholder="Enter full name" />
              </div>
              <div className="filter-group">
                <label className="filter-label">Username</label>
                <input className="auth-input" style={{ border: '1px solid #dadce0' }} value={formData.user_name} onChange={(e) => setFormData({...formData, user_name: e.target.value})} placeholder="Choose a username" />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="primary-btn btn-inline">Save Changes</button>
                <button type="button" className="outline-btn btn-inline" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div className="divider" style={{ margin: '2.5rem 0' }} />

          <h3 className="filter-header" style={{ fontSize: '18px', marginBottom: '1.5rem' }}>
            Security & Password
          </h3>

          {!isChangingPassword ? (
            <button className="outline-btn" onClick={() => setIsChangingPassword(true)}>
              Update Password
            </button>
          ) : (
            <form onSubmit={handleChangePassword}>
              <div className="filter-group">
                <label className="filter-label">Current Password</label>
                <input type="password" className="auth-input" style={{ border: '1px solid #dadce0' }} value={passwordData.old_password} onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})} />
              </div>
              <div className="filter-group">
                <label className="filter-label">New Password</label>
                <input type="password" className="auth-input" style={{ border: '1px solid #dadce0' }} value={passwordData.new_password} onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})} />
              </div>
              <div className="filter-group" style={{ marginBottom: '1.5rem' }}>
                <label className="filter-label">Confirm New Password</label>
                <input type="password" className="auth-input" style={{ border: '1px solid #dadce0' }} value={passwordData.confirm_password} onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="primary-btn btn-inline">Change Password</button>
                <button type="button" className="outline-btn btn-inline" onClick={() => setIsChangingPassword(false)}>Discard</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}