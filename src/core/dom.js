export function node(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
export function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
export function listen(target, type, handler, signal) {
  target.addEventListener(type, handler, { signal });
}
export function bind(root, signal, handler) {
  listen(
    root,
    "click",
    (event) => {
      const button = event.target.closest("[data-action]");
      if (button && root.contains(button))
        handler(button.dataset.action, button, event);
    },
    signal,
  );
}
