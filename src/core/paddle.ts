import * as Three from "three";

export interface Paddle {
  object: Three.Mesh;
  speed: Three.Vector2;
}
