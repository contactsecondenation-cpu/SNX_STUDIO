const KEY = "snx.studio.customThemes.v1";
export function loadCustomThemes() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}
function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}
export function addCustomTheme(theme) {
  const list = loadCustomThemes();
  list.push(theme);
  return save(list);
}
export function removeCustomTheme(id) {
  const list = loadCustomThemes().filter((t) => t.id !== id);
  return save(list);
}
export function slugifyThemeId(name) {
  const base = String(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return "custom-" + (base || "theme") + "-" + Date.now().toString(36);
}
