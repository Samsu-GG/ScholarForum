import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

/**
 * API Fetching Logic
 * Cleans up empty filters before sending to FastAPI.
 */
async function fetchSearchResult(searchParams) {
  const BASE_URL = "http://127.0.0.1:8000/search/";

  // Construct a clean object for the API (ignoring empty strings/nulls)
  const apiParams = {
    limit: 10,
    offset: 0,
  };

  if (searchParams.get("q")) apiParams.q = searchParams.get("q");
  if (searchParams.get("yearFrom")) apiParams.year_from = searchParams.get("yearFrom");
  if (searchParams.get("yearTo")) apiParams.year_to = searchParams.get("yearTo");
  if (searchParams.get("author")) apiParams.author = searchParams.get("author");
  if (searchParams.get("recentOnly") === "true") apiParams.recent_only = true;
  if (searchParams.get("sortBy")) apiParams.sort_by = searchParams.get("sortBy");

  const queryStr = new URLSearchParams(apiParams).toString();

  const response = await fetch(`${BASE_URL}?${queryStr}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`Error ${response.status}:`, errorData);
    throw new Error(`Backend error: ${response.status}`);
  }

  return await response.json();
}

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_FILTERS = {
  yearFrom: 1900,
  yearTo: CURRENT_YEAR,
  author: "",
  recentOnly: false,
  sortBy: "", 
};

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract current URL params to initialize UI state
  const query = searchParams.get("q") || "";

  // Component State
  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Draft filter state for the sidebar UI
  const [filters, setFilters] = useState({
    yearFrom: searchParams.get("yearFrom") ? parseInt(searchParams.get("yearFrom")) : DEFAULT_FILTERS.yearFrom,
    yearTo: searchParams.get("yearTo") ? parseInt(searchParams.get("yearTo")) : DEFAULT_FILTERS.yearTo,
    author: searchParams.get("author") || DEFAULT_FILTERS.author,
    recentOnly: searchParams.get("recentOnly") === "true",
    sortBy: searchParams.get("sortBy") || DEFAULT_FILTERS.sortBy,
  });

  // Keep search bar in sync if URL changes externally (e.g., hitting back button)
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  // Main Search Effect - triggers WHENEVER the URL search params change
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const runSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        // Pass the actual URLSearchParams to the fetcher
        const data = await fetchSearchResult(searchParams);
        setResults(data);
      } catch (err) {
        console.error("Search Error:", err);
        setError("Unable to connect to the server. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    runSearch();
  }, [searchParams, query]);

  // Updates the 'q' parameter while preserving other URL filters
  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      setSearchParams((prev) => {
        prev.set("q", trimmed);
        return prev;
      });
    } else {
      setSearchParams((prev) => {
        prev.delete("q");
        return prev;
      });
    }
  };

  // Pushes draft sidebar filters into the URL
  const applyFilters = () => {
    setSearchParams((prev) => {
      // Set or delete params based on whether they have a value
      filters.yearFrom ? prev.set("yearFrom", filters.yearFrom) : prev.delete("yearFrom");
      filters.yearTo ? prev.set("yearTo", filters.yearTo) : prev.delete("yearTo");
      filters.author ? prev.set("author", filters.author) : prev.delete("author");
      filters.recentOnly ? prev.set("recentOnly", "true") : prev.delete("recentOnly");
      filters.sortBy ? prev.set("sortBy", filters.sortBy) : prev.delete("sortBy");
      return prev;
    });
  };

  // Wipes the URL clean (except for 'q') and resets draft UI
  const clearFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setSearchParams((prev) => {
      const q = prev.get("q");
      const newParams = new URLSearchParams();
      if (q) newParams.set("q", q);
      return newParams;
    });
  };

  return (
    <div className="page-wrap">
      {/* ── Header ── */}
      <header className="search-header">
        <div className="search-header-logo" onClick={() => navigate("/")}>
          <span className="text-blue">S</span><span className="text-red">c</span>
          <span className="text-yellow">h</span><span className="text-blue">o</span>
          <span className="text-green">l</span><span className="text-red">a</span>
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
        <main className="search-results-main">
          {!query && <p className="status-text">Enter a search term above to get started.</p>}
          {loading && <p className="status-text">Searching for "<strong>{query}</strong>"…</p>}
          {error && <p className="status-text text-red">{error}</p>}
          
          {!loading && !error && query && results.length === 0 && (
            <p className="status-text">Your search — <strong>{query}</strong> — did not match any documents.</p>
          )}

          {!loading && results.map((item, index) => (
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
            {/* SVG omitted for brevity, keep yours! */}
            SEARCH FILTERS
          </div>

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
            </div>
          </div>

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

          <button className="filter-apply-btn" onClick={applyFilters}>
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