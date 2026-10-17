/** Keep document route metadata in sync so layout/CSS can adapt per route. */
export function syncRouteDocumentClass(pathname: string) {
  const onProject = pathname.startsWith("/project/");
  const onHome = !onProject;

  document.documentElement.classList.remove("route-doc-scroll");
  document.documentElement.dataset.route = onHome ? "home" : "project";
  return { onHome, onProject };
}
