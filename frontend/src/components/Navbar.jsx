import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user, loading, checkAuth, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    // Replace with your actual logout API call
    try {
      logout();
      toast.success("Logged out successfully!")
      setMenuOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading) return <nav className="navbar"></nav>;

  return (
    <nav className="navbar">
      {!isLoggedIn ? (
        <span onClick={() => navigate("/login")} className="link footer-text" style={{ color: "#5f6368" }}>
          Sign in
        </span>
      ) : (
        <div className="user-menu-wrapper" ref={menuRef}>
          <span 
            className="link user-name-trigger" 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {user?.full_name || "My Account"} ▾
          </span>

          {menuOpen && (
            <div className="user-dropdown">
              <div className="dropdown-item" onClick={() => navigate("/profile")}>
                Profile
              </div>
              <div className="dropdown-item" onClick={() => navigate("/settings")}>
                Settings
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout-text" onClick={handleLogout}>
                Sign out
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}