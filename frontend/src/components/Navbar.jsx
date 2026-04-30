import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <span onClick={() => navigate("/login")} className="link footer-text" style={{ color: "#5f6368" }}>
        Sign in
      </span>
    </nav>
  );
}