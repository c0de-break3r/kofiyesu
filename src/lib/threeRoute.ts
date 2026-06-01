/** Tear down the home 3D scene before chat/pay/doc routes paint. */
export function teardownHomeThreeScene() {
  document.documentElement.classList.add("route-doc-scroll");
  document.documentElement.dataset.route = "doc";

  void import("@/three/core/renderer").then(({ renderer }) => {
    renderer.setIsActive(false);
  });
  void import("@/three").then(({ three }) => three.destroy());
}

export function syncRouteDocumentClass(pathname: string) {
  const onChat = pathname.startsWith("/chat");
  const onPay = pathname.startsWith("/pay/");
  const onProject = pathname.startsWith("/project/");
  const onHome = !onChat && !onProject && !onPay;

  if (onChat || onPay) {
    document.documentElement.classList.add("route-doc-scroll");
    document.documentElement.dataset.route = onChat ? "chat" : "pay";
    return { onHome: false, onChat, onPay, onProject };
  }

  document.documentElement.classList.remove("route-doc-scroll");
  document.documentElement.dataset.route = onHome ? "home" : "project";
  return { onHome, onChat, onPay, onProject };
}
