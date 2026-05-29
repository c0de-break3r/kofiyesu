import { scenes } from "./scenes";
import { aboutProgress } from "./transitions/about";
import { room } from "../three/objects/room";
import { lab } from "../three/objects/lab";
import { desktops } from "../three/objects/room/desktops";

export function resetHomeScene() {
  scenes.resetSceneWeights();
  aboutProgress.value = 0;

  room.group.scale.set(1, 1, 1);
  room.group.position.set(0, 0, 0);
  room.group.rotation.set(0, -2.1, 0);
  room.chairScrollRotation.set(0, 0, 0);

  lab.group.position.set(0, 0, 6);
  lab.group.rotation.set(0, 0, 0);
  lab.group.scale.set(1, 1, 1);

  desktops.realign();
}
