import avatarModel from "./assets/models/avatar.glb";
import labModel from "./assets/models/lab.glb";
import roomModel from "./assets/models/room.glb";
import contactModel from "./assets/models/contact.glb";

import contactTexture from "./assets/textures/contact.webp";
import contactShadowTexture from "./assets/textures/contact-shadow.webp";
import desktopsTexture from "./assets/textures/desktops.webp";
import diffuseMap from "./assets/textures/diffuse-map.png";
import faceTexture from "./assets/textures/face-spritesheet.png";
import headTexture from "./assets/textures/head.webp";
import iconSpritesheet from "./assets/textures/icon-spritesheet.webp";
import matcapBlack from "./assets/textures/matcap-black.webp";
import matcapGray from "./assets/textures/matcap-gray.webp";
import matcapSkin from "./assets/textures/matcap-skin.webp";
import matcapWhite from "./assets/textures/matcap-white.webp";
import numbersBitmap from "./assets/textures/numbers-bitmap.webp";
import roomTexture from "./assets/textures/room.webp";
import roomShadowTexture from "./assets/textures/room-shadow.webp";
import hologramPlaneTexture from "./assets/textures/hologram-plane.webp";
import { isFeatureEnabled } from "./utils/features";

type Source = {
  name: string;
  type: "gltfModel" | "texture";
  path: string;
};

const coreSources = [
  { name: "lab-model", type: "gltfModel", path: labModel },
  { name: "room-model", type: "gltfModel", path: roomModel },
  { name: "contact-model", type: "gltfModel", path: contactModel },

  { name: "contact-texture", type: "texture", path: contactTexture },
  { name: "contact-shadow-texture", type: "texture", path: contactShadowTexture },
  { name: "desktops-texture", type: "texture", path: desktopsTexture },
  { name: "diffuse-map", type: "texture", path: diffuseMap },
  { name: "hologram-plane-texture", type: "texture", path: hologramPlaneTexture },
  { name: "icon-spritesheet", type: "texture", path: iconSpritesheet },
  { name: "numbers-bitmap", type: "texture", path: numbersBitmap },
  { name: "room-texture", type: "texture", path: roomTexture },
  { name: "room-shadow-texture", type: "texture", path: roomShadowTexture },
] as const satisfies readonly Source[];

const avatarSources = [
  { name: "avatar-model", type: "gltfModel", path: avatarModel },
  { name: "face-texture", type: "texture", path: faceTexture },
  { name: "head-texture", type: "texture", path: headTexture },
  { name: "matcap-black", type: "texture", path: matcapBlack },
  { name: "matcap-gray", type: "texture", path: matcapGray },
  { name: "matcap-skin", type: "texture", path: matcapSkin },
  { name: "matcap-white", type: "texture", path: matcapWhite },
] as const satisfies readonly Source[];

export const sources = [
  ...coreSources,
  ...(isFeatureEnabled("avatar") ? avatarSources : []),
] as const satisfies readonly Source[];
