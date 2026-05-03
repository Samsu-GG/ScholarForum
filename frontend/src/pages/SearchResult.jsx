import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

/**
 * API Fetching Logic
 * Sends search query and filters to the FastAPI backend.
 */
async function fetchSearchResult(query, filters) {
  // Update this URL to your actual FastAPI server address
  const BASE_URL = "http://127.0.0.1:8000/search/";

  const params = new URLSearchParams({
    q: query,
    year_from: filters.yearFrom,
    year_to: filters.yearTo,
    author: filters.author,
    recent_only: filters.recentOnly,
    sort_by: filters.sortBy || "",
    limit: 10,
    offset: 0
  });

  const response = await fetch(`${BASE_URL}?${params.toString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            })
  if (!response.ok) {
    console.error(`Error ${response.status}: ${response.statusText}`);
    const errorData = await response.json().catch(() => ({}));
    console.error("Error details:", errorData);
    throw new Error(`Backend error: ${response.status}`);
  }

  return await response.json();
}

const CURRENT_YEAR = new Date().getFullYear();

const DEFAULT_FILTERS = {
  yearFrom: 2010,
  yearTo: CURRENT_YEAR,
  author: "",
  recentOnly: false,
  sortBy: "", // Default is now empty
};

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const navigate = useNavigate();

  // Component State
  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter States: 'filters' is for the UI, 'applied' triggers the actual search
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [applied, setApplied] = useState({ ...DEFAULT_FILTERS });

  // Sync input field with URL query param
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  // Main Search Effect
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const runSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSearchResult(query, applied);
        setResults(data);
      } catch (err) {
        console.error("Search Error:", err);
        setError("Unable to connect to the server. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    runSearch();
  }, [query, applied]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const applyFilters = () => setApplied({ ...filters });

  const clearFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setApplied({ ...DEFAULT_FILTERS });
  };

  return (
    <div className="page-wrap">
      {/* ── Header ── */}
      <header className="search-header">
        <div className="search-header-logo" onClick={() => navigate("/")}>
          <span className="text-blue">S</span>
          <span className="text-red">c</span>
          <span className="text-yellow">h</span>
          <span className="text-blue">o</span>
          <span className="text-green">l</span>
          <span className="text-red">a</span>
          <span className="text-blue">r</span>
        </div>

        <form className="search-bar-form" onSubmit={handleSearch}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search Scholar Forum..."
            autoComplete="off"
            className="search-bar-input"
          />
          <button type="submit" className="primary-btn search-bar-btn">
            Search
          </button>
        </form>
      </header>

      {/* ── Body: results + filter panel ── */}
      <div className="search-body">
        {/* Results column */}
        <main className="search-results-main">
          {!query && (
            <p className="status-text">Enter a search term above to get started.</p>
          )}

          {loading && (
            <p className="status-text">
              Searching for "<strong>{query}</strong>"…
            </p>
          )}

          {error && <p className="status-text text-red">{error}</p>}

          {!loading && !error && query && results.length === 0 && (
            <p className="status-text">
              Your search — <strong>{query}</strong> — did not match any documents.
            </p>
          )}

          {!loading &&
            results.map((item, index) => (
              <div key={index} className="search-result-item">
                <h3 className="result-title">{item.title}</h3>
                <div className="result-meta">
                  <span>{item.author}</span>
                  <span className="result-meta-dot">·</span>
                  <span>{item.year}</span>
                </div>
                <p className="result-abstract">{item.abstract}</p>
              </div>
            ))}
        </main>

        {/* ── Filter panel ── */}
        <aside className="filter-panel">
          <div className="filter-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="16" y2="12" />
              <line x1="4" y1="18" x2="12" y2="18" />
            </svg>
            SEARCH FILTERS
          </div>

          {/* Keywords / Internal Search */}
          <div className="filter-group">
            <label className="filter-label">KEYWORDS</label>
            <div className="filter-input-wrap">
              <svg className="filter-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Global search..."
                className="filter-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(e); }}
              />
            </div>
          </div>

          {/* Year range */}
          <div className="filter-group">
            <label className="filter-label">SEARCH BETWEEN YEARS</label>
            <div className="filter-year-row">
              <input
                type="number"
                className="filter-input filter-year-input"
                value={filters.yearFrom}
                min="1900"
                max={filters.yearTo}
                onChange={(e) => setFilters((f) => ({ ...f, yearFrom: parseInt(e.target.value) || "" }))}
              />
              <span className="filter-year-to">to</span>
              <input
                type="number"
                className="filter-input filter-year-input"
                value={filters.yearTo}
                min={filters.yearFrom}
                max={CURRENT_YEAR}
                onChange={(e) => setFilters((f) => ({ ...f, yearTo: parseInt(e.target.value) || "" }))}
              />
            </div>
          </div>

          {/* Author */}
          <div className="filter-group">
            <label className="filter-label">AUTHOR</label>
            <div className="filter-input-wrap">
              <input
                type="text"
                placeholder="Search authors..."
                className="filter-input"
                value={filters.author}
                onChange={(e) => setFilters((f) => ({ ...f, author: e.target.value }))}
              />
              <svg className="filter-input-icon-right" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>

          {/* Recent publish toggle */}
          <div className="filter-group">
            <div className="filter-toggle-row">
              <div>
                <div className="filter-label">RECENT PUBLISH</div>
                <div className="filter-toggle-sub">Last 30 days only</div>
              </div>
              <button
                type="button"
                className={`filter-toggle${filters.recentOnly ? " filter-toggle-on" : ""}`}
                onClick={() => setFilters((f) => ({ ...f, recentOnly: !f.recentOnly }))}
              >
                <span className="filter-toggle-knob" />
              </button>
            </div>
          </div>

          {/* Sort by */}
          <div className="filter-group">
            <label className="filter-label">SORT BY</label>
            <div className="filter-select-wrap">
              <select
                className="filter-select"
                value={filters.sortBy}
                onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}
              >
                <option value="">Select an option</option>
                <option value="most_cited">Most Cited</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <button className="filter-apply-btn" onClick={applyFilters}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            APPLY FILTERS
          </button>
          <button className="filter-clear-btn" onClick={clearFilters}>
            CLEAR ALL
          </button>
        </aside>
      </div>
    </div>
  );
}