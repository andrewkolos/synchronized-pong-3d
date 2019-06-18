import * as Three from "three";

export class Paddle {
  public position: Three.Vector2;
  public zRotationRads: number;

  public velocity: Three.Vector2;
  public readonly width: number;
  public readonly height: number;

  public constructor(width: number, height: number, position?: Three.Vector2, speed?: Three.Vector2) {
    this.width = width;
    this.height = height;
    this.zRotationRads = 0;
    this.position = position != null ? position : new Three.Vector2();
    this.velocity = speed != null ? speed : new Three.Vector2();
  }
}
