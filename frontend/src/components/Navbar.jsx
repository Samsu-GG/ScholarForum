import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav style={{ display: "flex", justifyContent: "flex-end", padding: "14px 24px", borderBottom: "1px solid #e8eaed", background: "#fff" }}>
      <span onClick={() => navigate("/login")} style={{ fontSize: "13px", color: "#5f6368", cursor: "pointer" }}>
        Sign in
      </span>
    </nav>
  );
}