// Shared key, so the sidebar and the Media page reuse one request (and, in the
// generated site, one prerendered payload).
export const useMedia = () => useFetch("/api/media", { key: "media" });
