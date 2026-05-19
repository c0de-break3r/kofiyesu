/**
 * 3D scene color tweaks (room, lab, contact, shadows).
 *
 * - Texture tints: hex colors multiply the baked .webp atlases.
 *   Use `#ffffff` for no change; warmer/cooler examples: `#f5efe6`, `#e8f4fc`.
 * - For bigger visual changes, edit the source images in `src/assets/textures/`:
 *   `room.webp`, `contact.webp`, `lab` parts use shaders + `diffuse-map.png`.
 */
export const sceneColors = {
  roomTint: "#ffffff",
  contactTint: "#ffffff",
  shadowBackground: "#f5efe6",
  shadowTint: "rgb(215, 194, 169)",
  hologramPlaneTint: "#ffffff",
} as const;
