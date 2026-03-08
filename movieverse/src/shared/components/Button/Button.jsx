import styles from "./Button.module.scss";

export default function Button({
  children,
  variant = "primary",
  type = "button",
  disabled,
  className = "",
  as: Component = "button",
  ...rest
}) {
  const classNames = `${styles.btn} ${styles[variant]} ${className}`.trim();
  return (
    <Component type={Component === "button" ? type : undefined} className={classNames} disabled={disabled} {...rest}>
      {children}
    </Component>
  );
}
