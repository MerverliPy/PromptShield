import React from "react";

export function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article
      style={{
        padding: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
      }}
    >
      <p style={{ opacity: 0.7, marginBottom: 8 }}>{label}</p>
      <h3 style={{ margin: 0 }}>{value}</h3>
      <p style={{ opacity: 0.65 }}>{note}</p>
    </article>
  );
}
