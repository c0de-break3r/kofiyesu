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

export const validateAvatarModel = (gltf: GLTF): boolean => {
  const requiredMeshes = ["face", "head", "black", "gray", "skin", "white"];
  const requiredAnimations = [
    "idle",
    "t-idle",
    "left-desktop",
    "sleeping",
    "wake-up",
    "contact-idle",
    "wave",
  ];

  const meshNames = getMeshNames(gltf);
  const animationNames = getAnimationNames(gltf);
  const hasSkin = gltf.scene.children.some(
    (child) => "isSkinnedMesh" in child && (child as { isSkinnedMesh?: boolean }).isSkinnedMesh,
  );

  let valid = true;

  if (!hasSkin) {
    logModelIssue("avatar-model", "missing skinned mesh — use the rigged avatar.glb from the repo");
    valid = false;
  }

  for (const name of requiredMeshes) {
    if (!meshNames.includes(name)) {
      logModelIssue("avatar-model", `missing mesh "${name}"`);
      valid = false;
    }
  }

  for (const name of requiredAnimations) {
    if (!animationNames.includes(name)) {
      logModelIssue("avatar-model", `missing animation "${name}"`);
      valid = false;
    }
  }

  return valid;
};
