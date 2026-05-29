import { resources } from "../../../utils/resources";
import { BufferAttribute, LinearSRGBColorSpace, Mesh, RepeatWrapping, ShaderMaterial } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { room } from ".";
import fragmentShader from "../../shaders/desktops/fragment.glsl";
import vertexShader from "../../shaders/desktops/vertex.glsl";
import gsap from "gsap";
import { sceneWeights } from "../../../animations/scenes";
import { isFeatureEnabled } from "../../../utils/features";
import { animations as avatarAnimations } from "../avatar/animations";
import { leftDesktop as avatarLeftDesktop } from "../avatar/left-desktop";
import { playSound } from "../../../features/sounds/utils/sounds";

import type { BufferGeometry, Mesh as MeshType, Object3D } from "three";

let mesh: Mesh | null = null;
let material: ShaderMaterial | null = null;
let geometry: BufferGeometry | null = null;

let messageTween: gsap.core.Tween | null = null;
let scrollInterval: gsap.core.Tween | null = null;

const uniforms = {
  uScrollDepth: { value: 0 },
  uMessageIntensity: { value: 0 },
};

const findDesktopMesh = (root: Object3D, name: string): MeshType | undefined => {
  const found = root.getObjectByName(name);
  return found?.type === "Mesh" ? (found as MeshType) : undefined;
};

const bakeDesktopGeometry = (source: MeshType): BufferGeometry => {
  const baked = source.geometry.clone();
  baked.translate(source.position.x, source.position.y, source.position.z);
  return baked;
};

const teardownMesh = () => {
  if (mesh) {
    room.group.remove(mesh);
    mesh = null;
  }
  material?.dispose();
  material = null;
  geometry?.dispose();
  geometry = null;
};

const setupMesh = () => {
  teardownMesh();

  const resource = resources.items["room-model"];
  if (!resource?.scene) {
    if (import.meta.env.DEV) {
      console.warn("[desktops] room-model not loaded — skipping screen mesh");
    }
    return;
  }

  const desktop1 = findDesktopMesh(resource.scene, "desktop-plane-0");
  const desktop2 = findDesktopMesh(resource.scene, "desktop-plane-1");

  if (!desktop1 || !desktop2) {
    if (import.meta.env.DEV) {
      console.warn("[desktops] Missing desktop-plane-0 or desktop-plane-1 in room-model");
    }
    return;
  }

  const geo1 = bakeDesktopGeometry(desktop1);
  const geo2 = bakeDesktopGeometry(desktop2);

  const scrollIntensity1 = new Float32Array(geo1.attributes.position.count).fill(1);
  const scrollIntensity2 = new Float32Array(geo2.attributes.position.count).fill(0);
  geo1.setAttribute("scrollIntensity", new BufferAttribute(scrollIntensity1, 1));
  geo2.setAttribute("scrollIntensity", new BufferAttribute(scrollIntensity2, 1));

  const messageIntensity1 = new Float32Array(geo1.attributes.position.count).fill(0);
  const messageIntensity2 = new Float32Array(geo2.attributes.position.count).fill(1);
  geo1.setAttribute("messageIntensity", new BufferAttribute(messageIntensity1, 1));
  geo2.setAttribute("messageIntensity", new BufferAttribute(messageIntensity2, 1));

  const merged = mergeGeometries([geo1, geo2], false);
  geo1.dispose();
  geo2.dispose();

  if (!merged) {
    if (import.meta.env.DEV) console.warn("[desktops] mergeGeometries failed");
    return;
  }

  geometry = merged;

  const texture = resources.items["desktops-texture"];
  if (!texture) {
    geometry.dispose();
    geometry = null;
    if (import.meta.env.DEV) console.warn("[desktops] desktops-texture not loaded");
    return;
  }

  texture.colorSpace = LinearSRGBColorSpace;
  texture.flipY = false;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;

  material = new ShaderMaterial({
    fragmentShader,
    vertexShader,
    uniforms: {
      uTexture: { value: texture },
      ...uniforms,
    },
  });

  mesh = new Mesh(geometry, material);
  mesh.name = "desktops-screen";
  room.group.add(mesh);
};

const realign = () => {
  setupMesh();
  reset();
};

const init = () => {
  setupMesh();
  reset();
  startScrollInterval();
};

const startScrollInterval = () => {
  if (scrollInterval) scrollInterval.kill();

  scrollInterval = gsap.delayedCall(Math.random() * 2 + 3, () => {
    startScrollInterval();

    if (sceneWeights.hero < 0.95) return;

    if (isFeatureEnabled("avatar")) {
      const idleAction = avatarAnimations.actions.get("desktop-idle");
      if (!idleAction || idleAction.weight < 0.95) return;
      if (avatarLeftDesktop.getIsActive()) return;
    }

    scroll();

    if (Math.random() <= 0.33) {
      gsap.delayedCall(0.6, () => {
        if (sceneWeights.hero < 0.2) return;
        if (isFeatureEnabled("avatar")) {
          const idleAction = avatarAnimations.actions.get("desktop-idle");
          if (!idleAction || idleAction.weight < 0.95) return;
        }
        scroll();
      });
    }
  });
};

const scroll = () => {
  const scrollDepth = Math.random() * (-0.25 - 0.25) + 0.25;
  gsap.to(uniforms.uScrollDepth, { value: scrollDepth, duration: 1 });
  playSound("mouseWheel");
};

const showMessage = () => {
  if (messageTween) messageTween.kill();
  messageTween = gsap.fromTo(uniforms.uMessageIntensity, { value: 1 }, { value: 0, duration: 1, delay: 2 });
};

const reset = () => {
  uniforms.uScrollDepth.value = 0;
  uniforms.uMessageIntensity.value = 0;
  messageTween?.kill();
  messageTween = null;
};

const destroy = () => {
  reset();
  scrollInterval?.kill();
  scrollInterval = null;
  teardownMesh();
};

export const desktops = { init, destroy, reset, realign, scroll, showMessage };
