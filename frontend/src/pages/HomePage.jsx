import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />

      <main style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "2rem 1rem", gap: "2rem", background: "#fff",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "52px", fontWeight: 400, letterSpacing: "-1px", lineHeight: 1 }}>
            <span style={{ color: "#4285F4" }}>S</span>
            <span style={{ color: "#EA4335" }}>c</span>
            <span style={{ color: "#FBBC05" }}>h</span>
            <span style={{ color: "#4285F4" }}>o</span>
            <span style={{ color: "#34A853" }}>l</span>
            <span style={{ color: "#EA4335" }}>a</span>
            <span style={{ color: "#4285F4" }}>r</span>
            {" "}
            <span style={{ color: "#FBBC05" }}>F</span>
            <span style={{ color: "#34A853" }}>o</span>
            <span style={{ color: "#EA4335" }}>r</span>
            <span style={{ color: "#4285F4" }}>u</span>
            <span style={{ color: "#EA4335" }}>m</span>
          </h1>
          <p style={{ fontSize: "16px", color: "#5f6368", marginTop: "6px", letterSpacing: "0.5px" }}>
            Search · Discuss · Discover
          </p>
        </div>

        {/* Search bar */}
        <div style={{
          width: "100%", maxWidth: "560px", display: "flex", alignItems: "center",
          gap: "10px", background: "#fff", border: "1px solid #dfe1e5",
          borderRadius: "24px", padding: "10px 20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9aa0a6" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search Scholar Forum..."
            style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: "15px", color: "#202124" }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <button style={outlineBtn}>Forum Search</button>
          <button style={primaryBtn} onClick={() => navigate("/login")}>Sign In to Forum</button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        display: "flex", justifyContent: "center", gap: "20px",
        padding: "14px", borderTop: "1px solid #e8eaed",
        background: "#f2f2f2", flexWrap: "wrap",
      }}>
        {["About", "Help", "Privacy", "Terms"].map(l => (
          <span key={l} style={footerLink}>{l}</span>
        ))}
        <span style={footerLink} onClick={() => navigate("/login")}>Sign in</span>
        <span style={footerLink} onClick={() => navigate("/register")}>Register</span>
      </footer>
    </div>
  );
}

const outlineBtn = { padding: "9px 20px", borderRadius: "4px", fontSize: "14px", cursor: "pointer", border: "1px solid #dadce0", background: "#f8f9fa", color: "#3c4043" };
const primaryBtn = { ...outlineBtn, background: "#4285F4", color: "#fff", border: "1px solid #4285F4" };
const footerLink  = { fontSize: "13px", color: "#5f6368", cursor: "pointer" };