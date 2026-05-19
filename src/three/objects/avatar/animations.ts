import { avatar } from ".";
import { avatarHologram } from "./hologram";
import { AnimationAction, AnimationMixer, LoopOnce, LoopPingPong } from "three";
import gsap from "gsap";
import { resources } from "../../../utils/resources";
import { sceneWeights } from "../../../animations/scenes";
import { face } from "./face";
import { sleepingSprite } from "../contact/sleeping-sprite";
import { playSound } from "../../../features/sounds/utils/sounds";
import { isFeatureEnabled } from "../../../utils/features";
import { stopSnoreRepetition } from "../../../features/sounds/core/contact";

import type { AnimationClip, Object3D } from "three";

let mixer: AnimationMixer | undefined;
let activeAction: string | null = null;
const actions = new Map<string, AnimationAction>();
let isAwake = false;
const wavingStrength = { value: isFeatureEnabled("introWave") ? 1 : 0 };
let hologramMixer: AnimationMixer | undefined;
const hologramActions = new Map<string, AnimationAction>();

const init = () => {
  const avatarMesh = avatar.getMesh();
  const hologramMesh = avatarHologram.getMesh();
  if (!avatarMesh) return;

  mixer = new AnimationMixer(avatarMesh as Object3D);
  if (hologramMesh) {
    hologramMixer = new AnimationMixer(hologramMesh as Object3D);
  }

  setupActions();
  if (hologramMesh) setupHologramActions();

  if (actions.has("desktop-idle")) play("desktop-idle");
  if (actions.has("wave")) wave();
};

const getActionFromMesh = (name: string): AnimationClip | null => {
  const resource = resources.items["avatar-model"];
  if (!resource?.animations) return null;
  return resource.animations.find((animation: AnimationClip) => animation.name === name) ?? null;
};

const registerAction = (key: string, clipName: string, configure: (action: AnimationAction) => void) => {
  const clip = getActionFromMesh(clipName);
  if (!clip || !mixer) return;
  const action = mixer.clipAction(clip);
  configure(action);
  actions.set(key, action);
};

const registerHologramAction = (key: string, clipName: string, configure: (action: AnimationAction) => void) => {
  const clip = getActionFromMesh(clipName);
  if (!clip || !hologramMixer) return;
  const action = hologramMixer.clipAction(clip);
  configure(action);
  hologramActions.set(key, action);
};

const setupActions = () => {
  registerAction("desktop-idle", "idle", (action) => {
    action.loop = LoopPingPong;
    action.weight = 1;
  });

  registerAction("t-idle", "t-idle", (action) => {
    action.loop = LoopPingPong;
    action.weight = 0;
    action.play();
  });

  registerAction("left-desktop", "left-desktop", (action) => {
    action.repetitions = 1;
    action.clampWhenFinished = true;
    action.weight = 0;
  });

  registerAction("sleeping", "sleeping", (action) => {
    action.loop = LoopPingPong;
    action.weight = 1;
    action.play();
  });

  registerAction("wake-up", "wake-up", (action) => {
    action.repetitions = 1;
    action.clampWhenFinished = true;
  });

  registerAction("contact-idle", "contact-idle", (action) => {
    action.loop = LoopPingPong;
  });

  registerAction("wave", "wave", (action) => {
    action.clampWhenFinished = true;
    action.loop = LoopOnce;
  });
};

const setupHologramActions = () => {
  registerHologramAction("desktop-idle", "idle", (action) => {
    action.loop = LoopPingPong;
    action.weight = 1;
    action.play();
  });

  registerHologramAction("t-idle", "t-idle", (action) => {
    action.loop = LoopPingPong;
    action.weight = 0;
    action.play();
  });

  registerHologramAction("left-desktop", "left-desktop", (action) => {
    action.repetitions = 1;
    action.clampWhenFinished = true;
    action.weight = 0;
  });

  registerHologramAction("wave", "wave", (action) => {
    action.clampWhenFinished = true;
    action.loop = LoopOnce;
  });
};

const play = (name: string, transition: number = 0.5) => {
  if (activeAction === name) return;
  const newAction = actions.get(name);
  if (!newAction) return;

  const newHologramAction = hologramActions.get(name);

  newAction.reset().play();
  newHologramAction?.reset().play();

  if (activeAction) {
    const currentAction = actions.get(activeAction);
    if (currentAction) currentAction.crossFadeTo(newAction, transition);

    const currentHologramAction = hologramActions.get(activeAction);
    if (currentHologramAction && newHologramAction) {
      currentHologramAction.crossFadeTo(newHologramAction, transition);
    }
  }

  activeAction = name;
};

const setWeight = (key: string, weight: number) => {
  const action = actions.get(key);
  if (action) action.weight = weight;
  const hologramAction = hologramActions.get(key);
  if (hologramAction) hologramAction.weight = weight;
};

const updateIntro = () => {
  setWeight("desktop-idle", (1 - avatar.tIdleIntensity.value) * (1 - wavingStrength.value));
  setWeight("left-desktop", (1 - avatar.tIdleIntensity.value) * (1 - wavingStrength.value));
  setWeight("t-idle", avatar.tIdleIntensity.value);
  setWeight("sleeping", 0);
  setWeight("contact-idle", 0);
  setWeight("wake-up", 0);
  setWeight("wave", wavingStrength.value * (1 - avatar.tIdleIntensity.value));
};

const wave = () => {
  //get wave duration from action
  const waveAction = actions.get("wave");
  const hologramWaveAction = hologramActions.get("wave");
  if (!waveAction) return;
  const tl = gsap.timeline();

  const waveDuration = waveAction.getClip().duration;
  waveAction.play();
  hologramWaveAction?.play();

  tl.add(face.wave());
  tl.fromTo(wavingStrength, { value: 1 }, { value: 0 }, waveDuration - 0.2);

  return tl;
};

const wakeUp = () => {
  if (isAwake) return;
  isAwake = true;
  const sleepingAction = actions.get("sleeping");
  const wakeUpAction = actions.get("wake-up");
  const contactIdleAction = actions.get("contact-idle");
  if (!sleepingAction || !wakeUpAction || !contactIdleAction) return;

  stopSnoreRepetition();
  playSound("gasp");

  //crossfade to wake-up
  sleepingAction.crossFadeTo(wakeUpAction, 0.2);
  wakeUpAction.play();

  const wakeUpDuration = wakeUpAction.getClip().duration;

  setTimeout(() => {
    //crossfade to contact-idle
    wakeUpAction.crossFadeTo(contactIdleAction, 0.5);
    contactIdleAction.play();
  }, wakeUpDuration * 1000);

  face.wakeUp();
  sleepingSprite.hide();
};

const updateContact = () => {
  setWeight("desktop-idle", 0);
  setWeight("left-desktop", 0);
  setWeight("t-idle", 0);
  setWeight("sleeping", 1);
  setWeight("contact-idle", 1);
  setWeight("wake-up", 1);
  setWeight("wave", 0);
};

const update = () => {
  const isContact = sceneWeights.contact > 0.001;
  if (isContact) {
    updateContact();
  } else {
    updateIntro();
  }

  const delta = gsap.ticker.deltaRatio(60);
  mixer?.update(delta / 60);
  hologramMixer?.update(delta / 60);
};

export const animations = { init, play, actions, update, wakeUp, getIsAwake: () => isAwake, wave };
