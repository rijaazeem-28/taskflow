"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#F8FAFC",
          color: "#0F172A",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>TaskFlow unavailable</h1>
          <p style={{ color: "#64748B", maxWidth: 420, margin: "0 auto 24px" }}>
            A critical error occurred. Please retry. If it persists, refresh the page.
          </p>
          {error.digest ? (
            <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 20 }}>Ref: {error.digest}</p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              border: "none",
              borderRadius: 16,
              background: "#6366F1",
              color: "white",
              padding: "12px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
