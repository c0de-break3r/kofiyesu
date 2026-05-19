import { isFeatureEnabled } from "../../utils/features";
import { avatar } from "./avatar";
import { avatarHologram } from "./avatar/hologram";
import { contact } from "./contact";
import { darkPlane } from "./dark-plane";
import { gridFloor } from "./grid-floor";
import { lab } from "./lab";
import { room } from "./room";
import { sleepingSprite } from "./contact/sleeping-sprite";
import { renderer } from "../core/renderer";

const init = () => {
  if (isFeatureEnabled("avatar")) {
    avatarHologram.init();
    avatar.init();
  }
  contact.init();
  darkPlane.init();
  gridFloor.init();
  lab.init();
  room.init();
  sleepingSprite.init();

  renderer.compile();
};

const destroy = () => {
  if (isFeatureEnabled("avatar")) {
    avatarHologram.destroy();
    avatar.destroy();
  }
  contact.destroy();
  darkPlane.destroy();
  gridFloor.destroy();
  lab.destroy();
  room.destroy();
  sleepingSprite.destroy();
};

export const objects = { init, destroy };
