import { useState } from "react";

export default function AuthForm({ fields, validate, onSubmit, submitLabel = "Submit", disabled = false }) {
  const [values, setValues]   = useState(Object.fromEntries(fields.map(f => [f.id, ""])));
  const [errors, setErrors]   = useState({});

  const change = (id, val) => {
    setValues(v => ({ ...v, [id]: val }));
    if (errors[id]) setErrors(e => ({ ...e, [id]: "" }));
  };

  const submit = () => {
    const errs = validate(values);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(values);
  };

  const rows = [];
  let i = 0;
  while (i < fields.length) {
    if (fields[i].half && fields[i + 1]?.half) {
      rows.push([fields[i], fields[i + 1]]); i += 2;
    } else {
      rows.push([fields[i]]); i += 1;
    }
  }

  return (
    <div>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "grid", gridTemplateColumns: row.length === 2 ? "1fr 1fr" : "1fr", gap: "12px" }}>
          {row.map(f => (
            <div key={f.id} style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#5f6368", marginBottom: "5px" }}>{f.label}</label>
              {f.type === "radio" ? (
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {f.options.map(opt => (
                    <label key={opt} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input
                        type="radio"
                        name={f.id}
                        value={opt}
                        checked={values[f.id] === opt}
                        onChange={() => change(f.id, opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type={f.type}
                  value={values[f.id]}
                  placeholder={f.placeholder}
                  onChange={e => change(f.id, e.target.value)}
                  className="auth-input"
                  style={{
                    border: `1px solid ${errors[f.id] ? "#d93025" : "#dadce0"}`,
                  }}
                />
              )}
              {errors[f.id] && <p style={{ fontSize: "12px", color: "#d93025", marginTop: "4px" }}>{errors[f.id]}</p>}
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={submit}
        disabled={disabled}
        className="primary-btn"
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.7 : 1,
        }}
      >
        {submitLabel}
      </button>
    </div>
  );
}