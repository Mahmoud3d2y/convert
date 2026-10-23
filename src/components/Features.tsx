import type { Dictionary } from "@/lib/i18n";

export default function Features({ t }: { t: Dictionary }) {
  return (
    <ul className="features">
      {t.features.map((f) => (
        <li key={f.title}>
          <span className="feature-icon" aria-hidden="true">{f.icon}</span>
          <h3>{f.title}</h3>
          <p>{f.text}</p>
        </li>
      ))}
    </ul>
  );
}
