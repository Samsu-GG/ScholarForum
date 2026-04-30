import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const goToSearch = () => {
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") goToSearch();
  };

  return (
    <div className="page-wrap">
      <Navbar />

      <main className="home-main">
        {/* Logo */}
        <div style={{ textAlign: "center" }}>
          <h1 className="home-title">
            <span className="text-blue">S</span>
            <span className="text-red">c</span>
            <span className="text-yellow">h</span>
            <span className="text-blue">o</span>
            <span className="text-green">l</span>
            <span className="text-red">a</span>
            <span className="text-blue">r</span>
            {" "}
            <span className="text-yellow">F</span>
            <span className="text-green">o</span>
            <span className="text-red">r</span>
            <span className="text-blue">u</span>
            <span className="text-red">m</span>
          </h1>
          <p className="home-subtitle">Search · Discuss · Discover</p>
        </div>

        {/* Search bar */}
        <div className="search-bar-container">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9aa0a6" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search Scholar Forum..."
            className="search-input"
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <button className="outline-btn btn-inline" onClick={goToSearch}>
            Forum Search
          </button>
          <button className="primary-btn btn-inline" onClick={() => navigate("/login")}>
            Sign In to Forum
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer-nav">
        {["About", "Help", "Privacy", "Terms"].map((l) => (
          <span key={l} className="link">{l}</span>
        ))}
        <span className="link" onClick={() => navigate("/login")}>Sign in</span>
        <span className="link" onClick={() => navigate("/register")}>Register</span>
      </footer>
    </div>
  );
}