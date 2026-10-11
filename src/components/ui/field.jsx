export function Field({ label, name, children, hint, ...props }) {
  return <div className="field">
    <label htmlFor={name}>{label}</label>
    {children || <input id={name} name={name} {...props} />}
    {hint && <small>{hint}</small>}
  </div>;
}