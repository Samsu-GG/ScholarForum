import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import Navbar from "../components/Navbar";

export default function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  console.log("ResultPage mounted! Extracted ID parameter is:", id);

  useEffect(() => {
    const fetchPaperDetails = async () => {
      setLoading(true);
      try {
        // 1. Fetch paper details using GET and the ID from the URL
        const response = await fetch(`http://127.0.0.1:8000/papers/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();

          // 2. Map backend model fields to frontend state
          setPaper({
            title: data.title,
            authors: data.authors,
            publication: data.publish_date,
            abstract: data.abstract,
            pdfLink: data.pdf_link
          });

          // If your backend returns comments with the paper, set them here
          if (data.comments) {
            setComments(data.comments);
          }
        } else {
          setPaper(null);
        }
      } catch (error) {
        console.error("Error fetching paper details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPaperDetails();
  }, [id]);

  const handlePostComment = async () => {
  if (!newComment.trim()) return;

  try {
    const token = localStorage.getItem("token"); // Grab auth token
    
    const response = await fetch(`http://127.0.0.1:8000/papers/${id}/comments`, {
      method: "POST",  
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ text: newComment }) 
    });

    if (response.ok) {
      const addedComment = await response.json();
      // Update UI state cleanly
      setComments([addedComment, ...comments]);
      setNewComment("");
    }
  } catch (error) {
    console.error("Failed to post comment:", error);
  }
};

  if (loading) {
    return (
      <div className="page-wrap">
        <Navbar />
        <main className="search-results-main" style={{ textAlign: "center", marginTop: "50px" }}>
          <p className="status-text">Loading paper details...</p>[cite: 6]
        </main>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="page-wrap">
        <div className="back-bar" onClick={() => navigate("/")}>&#8592; Back to Home</div>
        <Navbar />
        <main className="search-results-main" style={{ textAlign: "center", marginTop: "50px" }}>
          <h2 className="status-text">Paper not found.</h2>
          <button className="primary-btn" onClick={() => navigate(-1)}>Go Back</button>
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <div className="back-bar" onClick={() => navigate(-1)}>&#8592; Back to Results</div>
      <Navbar />

      <main className="search-results-main" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        {/* Title Section */}
        <h1 style={{ fontSize: "2.5rem", color: "#1a0dab", marginBottom: "10px", lineHeight: "1.2" }}>
          {paper.title}
        </h1>

        {/* Authors and Metadata */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: "500", color: "#006621", marginBottom: "5px" }}>
            {paper.authors}
          </p>
          <p style={{ fontSize: "1rem", color: "#5f6368", fontStyle: "italic" }}>
            Published: {paper.publication}
          </p>
        </div>

        {/* Abstract Section */}
        <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "8px", marginBottom: "25px", border: "1px solid #dadce0" }}>
          <h3 className="filter-header" style={{ marginTop: 0, marginBottom: "10px" }}>ABSTRACT</h3>
          <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#4d5156", margin: 0 }}>
            {paper.abstract}
          </p>
        </div>

        {/* PDF Access */}
        <div style={{ marginBottom: "40px" }}>
          <a
            href={paper.pdfLink}
            target="_blank"
            rel="noopener noreferrer"
            className="primary-btn"
            style={{ display: "inline-block", textDecoration: "none", padding: "10px 20px" }}
          >
            View Full PDF
          </a>
        </div>

        <div className="divider" style={{ margin: "30px 0" }}></div>

        {/* Comment Section */}
        <section className="comments-section">
          <h3 style={{ fontSize: "1.5rem", marginBottom: "20px", color: "#202124" }}>
            Discussion ({comments.length})
          </h3>

          <div style={{ marginBottom: "30px" }}>
            {!isLoggedIn ? (
              <div style={{ padding: "15px", backgroundColor: "#f1f3f4", borderRadius: "8px", textAlign: "center" }}>
                <p style={{ margin: "0 0 10px 0", color: "#5f6368" }}>Sign in to join the conversation.</p>
                <button className="outline-btn" onClick={() => navigate("/login")}>Sign In</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <textarea
                  className="auth-input"
                  style={{ minHeight: "100px", padding: "12px", borderRadius: "8px" }}
                  placeholder="What are your thoughts on this research?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  className="primary-btn"
                  style={{ alignSelf: "flex-end" }}
                  onClick={handlePostComment}
                  disabled={!newComment.trim()}
                >
                  Post Comment
                </button>
              </div>
            )}
          </div>

          {/* Comment Results List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {comments.map((comment) => (
              <div key={comment.id} style={{ padding: "15px", border: "1px solid #dadce0", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <strong style={{ color: "#202124" }}>{comment.author_name || "Scholar User"}</strong>
                  <span style={{ fontSize: "0.8rem", color: "#70757a" }}>{comment.date}</span>
                </div>
                <p style={{ margin: 0, color: "#3c4043" }}>{comment.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}