import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { registerUser, clearError } from "../state/authSlice";
import Button from "../../../shared/components/Button/Button";
import styles from "./RegisterPage.module.scss";

function EyeIcon({ show }) {
  return show ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const fieldErrors = error?.errors?.length
    ? error.errors.reduce((acc, { field, message }) => ({ ...acc, [field]: message }), {})
    : {};
  const generalMessage = typeof error === "string" ? error : error?.message;

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(registerUser({ name, email, password }))
      .unwrap()
      .then(() => {
        toast.success("Account created. Welcome!");
        navigate("/", { replace: true });
      })
      .catch((err) => {
        const msg = err?.errors?.[0]?.message || (typeof err === "string" ? err : err?.message) || "Registration failed";
        toast.error(msg);
      });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign up</h1>
        <p className={styles.subtitle}>Create your account to save favorites and watch history</p>
        {generalMessage && !error?.errors?.length && (
          <p className={styles.error} role="alert">{generalMessage}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldErrors.name ? `${styles.input} ${styles.inputError}` : styles.input}
              placeholder="Your name"
              required
              autoComplete="name"
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
            />
            {fieldErrors.name && (
              <p id="name-error" className={styles.fieldError} role="alert">{fieldErrors.name}</p>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldErrors.email ? `${styles.input} ${styles.inputError}` : styles.input}
              placeholder="you@example.com"
              required
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            {fieldErrors.email && (
              <p id="email-error" className={styles.fieldError} role="alert">{fieldErrors.email}</p>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldErrors.password ? `${styles.input} ${styles.inputError}` : styles.input}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                <EyeIcon show={showPassword} />
              </button>
            </div>
            {fieldErrors.password && (
              <p id="password-error" className={styles.fieldError} role="alert">{fieldErrors.password}</p>
            )}
          </div>
          <Button type="submit" variant="primary" className={styles.submit} disabled={loading}>
            {loading ? "Creating account…" : "Sign up"}
          </Button>
        </form>
        <p className={styles.footer}>
          Already have an account? <Link to="/login" className={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
