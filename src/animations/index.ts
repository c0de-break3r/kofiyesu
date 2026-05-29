import { waypoints } from "./waypoints";
import { scenes } from "./scenes";
import { about } from "./transitions/about";
import { contact } from "./transitions/contact";
import { intro } from "./intro";
import { resetHomeScene } from "./resetHomeScene";

export const transitions = {
  about,
  contact,
};

let isInitialized = false;

const init = () => {
  if (isInitialized) return;
  resetHomeScene();
  scenes.init();
  waypoints.init();
  intro.play();
  isInitialized = true;
};

const destroy = () => {
  if (!isInitialized) return;
  resetHomeScene();
  scenes.destroy();
  waypoints.destroy();
  isInitialized = false;
};

export const animations = { init, destroy };
