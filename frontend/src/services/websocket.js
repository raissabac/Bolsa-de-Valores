export function conectarMercado() {
  const base = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
  ).replace(/\/$/, "");

  const url = new URL(`${base}/ws`, window.location.origin);

  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

  return new WebSocket(url);
}