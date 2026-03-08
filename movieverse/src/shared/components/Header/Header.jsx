import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { logoutUser } from "../../../features/auth/state/authSlice";
import { useTheme } from "../../../shared/contexts/ThemeContext";
import styles from "./Header.module.scss";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
    { to: "/search", label: "Search" },
    { to: "/browse", label: "Browse" },
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
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`${styles.navLink} ${location.pathname === to ? styles.active : ""}`}
            onClick={closeMobileMenu}
          >
            {label}
          </Link>
        ))}
        {!isAuthenticated && (
          <>
            <Link to="/login" className={`${styles.navLink} ${styles.navLinkAuth}`} onClick={closeMobileMenu}>
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
            onClick={() => { toggleTheme(); closeMobileMenu(); }}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
            <span> {theme === "dark" ? "Light" : "Dark"} mode</span>
          </button>
        </div>
      </nav>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
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
                <button type="button" className={styles.dropdownItem} onClick={handleLogout}>
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
