import * as Three from 'three';

export class Paddle {
  public position: Three.Vector2;

  /** The rotation of the paddle. */
  public zRotationEulers: number;

  /** Represents the speed and direction that the paddle is currently moving in. */
  public velocity: Three.Vector2;
  public readonly width: number;
  public readonly height: number;

  /**
   * Creates an instance of paddle.
   * @param width The width of the paddle.
   * @param height The height of the paddle.
   * @param [position] The initial position of the paddle. Defaults to (0, 0).
   * @param [velocity] The initial velocity of the paddle. Defaults to (0, 0).
   */
  public constructor(width: number, height: number, position?: Three.Vector2, velocity?: Three.Vector2) {
    this.width = width;
    this.height = height;
    this.zRotationEulers = 0;
    this.position = position != null ? position : new Three.Vector2();
    this.velocity = velocity != null ? velocity : new Three.Vector2();
  }
}
