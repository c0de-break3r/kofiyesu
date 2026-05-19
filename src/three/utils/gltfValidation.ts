import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

const isProd = import.meta.env.PROD;

export const logModelIssue = (modelName: string, message: string) => {
  if (isProd) return;
  console.warn(`[Models] ${modelName}: ${message}`);
};

export const getAnimationNames = (gltf: GLTF): string[] =>
  gltf.animations.map((clip) => clip.name).filter(Boolean);

export const getMeshNames = (gltf: GLTF): string[] => {
  const names: string[] = [];
  gltf.scene.traverse((child) => {
    if ("isMesh" in child && child.isMesh && child.name) {
      names.push(child.name);
    }
  });
  return names;
};

const REQUIRED_AVATAR_MESHES = ["face", "head", "black", "gray", "skin", "white"] as const;
const REQUIRED_AVATAR_ANIMATIONS = [
  "idle",
  "t-idle",
  "left-desktop",
  "sleeping",
  "wake-up",
  "contact-idle",
  "wave",
] as const;

const hasSkinnedMesh = (gltf: GLTF) =>
  gltf.scene.children.some(
    (child) => "isSkinnedMesh" in child && (child as { isSkinnedMesh?: boolean }).isSkinnedMesh,
  ) ||
  (() => {
    let found = false;
    gltf.scene.traverse((child) => {
      if ("isSkinnedMesh" in child && (child as { isSkinnedMesh?: boolean }).isSkinnedMesh) {
        found = true;
      }
    });
    return found;
  })();

/** Rigged portfolio avatar (meshes + clips) vs static replacement mesh. */
export const isRiggedAvatarModel = (gltf: GLTF): boolean => {
  const meshNames = getMeshNames(gltf);
  const animationNames = getAnimationNames(gltf);

  if (!hasSkinnedMesh(gltf)) return false;

  return (
    REQUIRED_AVATAR_MESHES.every((name) => meshNames.includes(name)) &&
    REQUIRED_AVATAR_ANIMATIONS.every((name) => animationNames.includes(name))
  );
};

export const validateAvatarModel = (gltf: GLTF): boolean => {
  const meshNames = getMeshNames(gltf);
  const animationNames = getAnimationNames(gltf);
  let valid = true;

  if (!hasSkinnedMesh(gltf)) {
    logModelIssue("avatar-model", "missing skinned mesh — use the rigged avatar.glb from the repo");
    valid = false;
  }

  for (const name of REQUIRED_AVATAR_MESHES) {
    if (!meshNames.includes(name)) {
      logModelIssue("avatar-model", `missing mesh "${name}"`);
      valid = false;
    }
  }

  for (const name of REQUIRED_AVATAR_ANIMATIONS) {
    if (!animationNames.includes(name)) {
      logModelIssue("avatar-model", `missing animation "${name}"`);
      valid = false;
    }
  }

  return valid;
};
