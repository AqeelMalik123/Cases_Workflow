export default function Loading({
  message = "Loading...",
}: {
  message?: string;
}) {
  return <div style={{ padding: 20 }}>{message}</div>;
}
