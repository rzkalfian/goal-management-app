"use client";
import { useMemo, useState } from "react";
import { DynamicIcon, iconNames } from "lucide-react/dynamic";

const LIMIT = 48;
export function IconPicker({ value, onChange }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const term = query.trim().toLowerCase().replaceAll(" ", "-");
    return iconNames.filter((name) => name.includes(term)).slice(0, LIMIT);
  }, [query]);
  return (
    <div className="field">
      <label htmlFor="icon-search">Ikon (Lucide)</label>
      <input
        id="icon-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cari ikon, mis. book, heart, car"
        autoComplete="off"
      />
      <input type="hidden" name="icon" value={value} />
      <p className="icon-current">
        {value ? (
          <>
            <DynamicIcon name={value} size={18} aria-hidden="true" /> {value}
            <button
              type="button"
              className="icon-clear"
              onClick={() => onChange("")}
            >
              Hapus ikon
            </button>
          </>
        ) : (
          "Belum ada ikon dipilih."
        )}
      </p>
      <div className="icon-grid" role="group" aria-label="Pilih ikon">
        {matches.map((name) => (
          <button
            type="button"
            key={name}
            title={name}
            aria-label={name}
            aria-pressed={name === value}
            className="icon-option"
            onClick={() => onChange(name)}
          >
            <DynamicIcon name={name} size={20} aria-hidden="true" />
          </button>
        ))}
      </div>
      {!matches.length && <small>Ikon tidak ditemukan.</small>}
    </div>
  );
}
