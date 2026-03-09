import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RiSearchLine, RiSunLine, RiMoonLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { useDebounce } from "../../../features/search/hooks/useDebounce";
import { logoutUser } from "../../../features/auth/state/authSlice";
import { useTheme } from "../../../shared/contexts/ThemeContext";
import styles from "./Header.module.scss";

const SEARCH_DEBOUNCE_MS = 400;

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // When on the search page and debounced search text changes, update the URL so results update. Do not run when on other pages (so clicking Home/Movies/TV etc. works).
  useEffect(() => {
    if (location.pathname !== "/search") return;
    const nextQ = debouncedSearchQuery.trim();
    const currentQ = new URLSearchParams(location.search).get("q") || "";
    if (nextQ === currentQ) return;
    const target = nextQ ? `/search?q=${encodeURIComponent(nextQ)}` : "/search";
    navigate(target, { replace: true });
  }, [debouncedSearchQuery, location.pathname, location.search, navigate]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (location.pathname === "/search") {
      const q = new URLSearchParams(location.search).get("q") || "";
      setSearchQuery(q);
    }
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      closeMobileMenu();
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    setDropdownOpen(false);
    toast("Logged out.");
    navigate("/");
  };

  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/browse?type=movie", label: "Movies" },
    { to: "/browse?type=tv", label: "TV" },
    ...(isAuthenticated
      ? [
          { to: "/favorites", label: "Favorites" },
          { to: "/watch-history", label: "Watch History" },
        ]
      : []),
  ];

  return (
    <header className={styles.header} data-theme={theme}>
      <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
        Movieverse
      </Link>
      <form
        className={styles.searchForm}
        onSubmit={handleSearchSubmit}
        role="search"
      >
        <input
          ref={searchInputRef}
          type="search"
          className={styles.searchInput}
          placeholder="Search movies & TV…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search movies and TV shows"
        />
        <button type="submit" className={styles.searchBtn} aria-label="Search">
          <RiSearchLine size={18} />
        </button>
      </form>

      <button
        type="button"
        className={styles.hamburger}
        onClick={() => setMobileMenuOpen((o) => !o)}
        aria-expanded={mobileMenuOpen}
        aria-label="Toggle menu"
      >
        <span className={styles.hamburgerBar} />
        <span className={styles.hamburgerBar} />
        <span className={styles.hamburgerBar} />
      </button>

      <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ""}`}>
        {navLinks.map(({ to, label }) => {
          const isActive = to.startsWith("/browse")
            ? (to.includes("type=movie") &&
                location.pathname === "/browse" &&
                new URLSearchParams(location.search).get("type") === "movie") ||
              (to.includes("type=tv") &&
                location.pathname === "/browse" &&
                new URLSearchParams(location.search).get("type") === "tv")
            : location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`${styles.navLink} ${isActive ? styles.active : ""}`}
              onClick={closeMobileMenu}
            >
              {label}
            </Link>
          );
        })}
        {!isAuthenticated && (
          <>
            <Link
              to="/login"
              className={`${styles.navLink} ${styles.navLinkAuth}`}
              onClick={closeMobileMenu}
            >
              Log in
            </Link>
            <Link
              to="/register"
              className={`${styles.navLink} ${styles.navLinkAuth} ${location.pathname === "/register" ? styles.active : ""}`}
              onClick={closeMobileMenu}
            >
              Sign up
            </Link>
          </>
        )}
        <div className={styles.navThemeWrap}>
          <button
            type="button"
            className={styles.themeToggleInNav}
            onClick={() => {
              toggleTheme();
              closeMobileMenu();
            }}
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <RiSunLine size={18} />
            ) : (
              <RiMoonLine size={18} />
            )}
            <span> {theme === "dark" ? "Light" : "Dark"} mode</span>
          </button>
        </div>
      </nav>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={toggleTheme}
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <RiSunLine size={20} />
          ) : (
            <RiMoonLine size={20} />
          )}
        </button>
        {isAuthenticated ? (
          <div className={styles.userMenu} ref={dropdownRef}>
            <button
              type="button"
              className={styles.userButton}
              onClick={() => setDropdownOpen((o) => !o)}
              aria-expanded={dropdownOpen}
            >
              <span className={styles.userName}>{user?.name || "Account"}</span>
              <span aria-hidden>▾</span>
            </button>
            {dropdownOpen && (
              <div className={styles.dropdown}>
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className={styles.navLinkDesktop}>
              Log in
            </Link>
            <Link
              to="/register"
              className={`${styles.navLinkDesktop} ${location.pathname === "/register" ? styles.active : ""}`}
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
