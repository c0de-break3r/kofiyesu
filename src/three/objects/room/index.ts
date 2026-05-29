import { resources } from "../../../utils/resources";
import { scene } from "../../core/scene";
import { Euler, Group, Mesh } from "three";
import { getRoomMaterial } from "../../common/materials";
import { sceneWeights } from "../../../animations/scenes";
import gsap from "gsap";
import { shadow } from "./shadow";
import { desktops } from "./desktops";
import { mouse } from "./mouse";
import { messagePopup } from "./message-popup";
import { penguin } from "./penguin";
import { music } from "./music";

import type { Object3D } from "three";

const group = new Group();
const chairScrollRotation = new Euler();

let objects: {
  blackboard: Mesh;
  carpet: Mesh;
  chair: Mesh;
  frame: Mesh;
  mouse: Mesh;
  music: Mesh;
  penguin: Mesh;
  "penguin-wing-left": Mesh;
  "penguin-wing-right": Mesh;
  plant: Mesh;
  room: Mesh;
  shelf: Mesh;
} | null = null;

let roomInitialized = false;

const init = () => {
  if (roomInitialized) return;
  roomInitialized = true;

  group.rotation.set(0, -2.1, 0);
  gsap.ticker.add(tick);
  initObjects();
  shadow.init();
  desktops.init();
  messagePopup.init();
  if (objects?.mouse) mouse.init(objects.mouse);
  if (objects?.penguin)
    penguin.init(objects.penguin, { left: objects["penguin-wing-left"], right: objects["penguin-wing-right"] });

  if (objects?.music) music.init(objects.music);
};

const initObjects = () => {
  if (objects) return;
  const resource = resources.items["room-model"];

  const penguin = resource.scene.children.find((child: Object3D) => child.name === "penguin") as
    | Object3D
    | undefined;

  objects = {
    blackboard: resource.scene.children.find((child: Object3D) => child.name === "blackboard") as Mesh,
    carpet: resource.scene.children.find((child: Object3D) => child.name === "carpet") as Mesh,
    chair: resource.scene.children.find((child: Object3D) => child.name === "chair") as Mesh,
    frame: resource.scene.children.find((child: Object3D) => child.name === "frame") as Mesh,
    mouse: resource.scene.children.find((child: Object3D) => child.name === "mouse") as Mesh,
    music: resource.scene.children.find((child: Object3D) => child.name === "music") as Mesh,
    plant: resource.scene.children.find((child: Object3D) => child.name === "plant") as Mesh,
    room: resource.scene.children.find((child: Object3D) => child.name === "room") as Mesh,
    shelf: resource.scene.children.find((child: Object3D) => child.name === "shelf") as Mesh,
    penguin: penguin as Mesh,
    "penguin-wing-left": penguin?.children.find((child: Object3D) => child.name === "penguin-wing-left") as Mesh,
    "penguin-wing-right": penguin?.children.find((child: Object3D) => child.name === "penguin-wing-right") as Mesh,
  };

  Object.entries(objects).forEach(([name, object]) => {
    if (!object) {
      if (import.meta.env.DEV) console.warn(`[Models] room-model: missing object "${name}"`);
      return;
    }
    const mat = getRoomMaterial();
    object.material = mat;
    group.add(object);

    if (object.name === "carpet") {
      object.renderOrder = -10;
      object.onBeforeRender = () => {
        mat.depthWrite = false;
      };

      object.onAfterRender = () => {
        mat.depthWrite = true;
      };
    }
  });

  scene.instance.add(group);
};

const tick = () => {
  group.visible = sceneWeights.hero > 0.001;

  if (objects?.chair) {
    objects.chair.rotation.copy(chairScrollRotation);
  }

  penguin.tick();
  music.tick();
};

const destroy = () => {
  if (!roomInitialized) return;
  roomInitialized = false;

  gsap.ticker.remove(tick);
  shadow.destroy();
  messagePopup.destroy();
  desktops.destroy();
  mouse.destroy();
  penguin.destroy();
  music.destroy();

  group.scale.set(1, 1, 1);
  group.position.set(0, 0, 0);
  group.rotation.set(0, -2.1, 0);
  chairScrollRotation.set(0, 0, 0);
};

export const room = { init, destroy, group, chairScrollRotation };
