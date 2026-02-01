export default function ErrorBlock({
  message = "Something went wrong",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      style={{
        padding: 10,
        border: "1px solid #e66",
        background: "#fff5f5",
        color: "#700",
      }}
    >
      <div style={{ marginBottom: 8 }}>{message}</div>
      {onRetry && (
        <button onClick={onRetry} style={{ padding: "6px 10px" }}>
          Retry
        </button>
      )}
    </div>
  );
}
