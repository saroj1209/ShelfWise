export function getStoredValue(key, fallback, storage = typeof window !== "undefined" ? window.localStorage : null) {
  if (!storage) return fallback;

  const raw = typeof storage.getItem === "function"
    ? storage.getItem(key)
    : storage[key];

  if (!raw) return fallback;

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setStoredValue(key, value, storage = typeof window !== "undefined" ? window.localStorage : null) {
  if (!storage) return;

  if (typeof storage.setItem === "function") {
    storage.setItem(key, JSON.stringify(value));
  } else {
    storage[key] = JSON.stringify(value);
  }
}
