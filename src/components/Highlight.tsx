import { highlightSegments } from "../../shared/search";

export function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  return (
    <>
      {highlightSegments(text, query).map((s, i) =>
        s.hit ? (
          <mark key={i} className="rounded-sm bg-sun-200 px-0.5 text-ink">
            {s.t}
          </mark>
        ) : (
          <span key={i}>{s.t}</span>
        ),
      )}
    </>
  );
}
