"use client";
import { useState } from "react";
import { EyeIcon, EyeClosedIcon } from "@solar-icons/react/linear";

export function Field({ label, name, children, hint, ...props }) {
  const [shown, setShown] = useState(false);
  const secret = props.type === "password";
  const input = (
    <input
      id={name}
      name={name}
      {...props}
      type={secret && shown ? "text" : props.type}
    />
  );
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children ||
        (secret ? (
          <div className="password-wrap">
            {input}
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShown(!shown)}
              aria-label={shown ? "Sembunyikan password" : "Tampilkan password"}
              aria-pressed={shown}
            >
              {shown ? <EyeClosedIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>
        ) : (
          input
        ))}
      {hint && <small>{hint}</small>}
    </div>
  );
}
