import * as Three from "three";
import { Pong3dBallConfig } from "./config/config";

export class Ball {

  /** The distanced traveled by the ball per game tick. */
  public velocity: Three.Vector2;
  public readonly radius: number;
  public position: Three.Vector2;
  public collidingWithPaddle: boolean;
  public collidingWithWall: boolean;

  public constructor(config: Pong3dBallConfig) {
    this.radius = config.radius;

    this.velocity = new Three.Vector2();
    this.position = new Three.Vector2();
    this.collidingWithPaddle = false;
    this.collidingWithWall = false;
  }
}
