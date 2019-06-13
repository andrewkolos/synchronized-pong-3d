import Three from "three";

export class Ball {

  public object: Three.Group;
  public innerObject: Three.Mesh;
  public dx: number;
  public dy: number;
  public collidingWithPaddle: boolean;
  public collidingWithWall: boolean;

  public constructor(object: Three.Group, innerObject: Three.Mesh, initDx: number, initDy: number) {
    this.object = object;
    this.innerObject = innerObject;
    this.dx = initDx;
    this.dy = initDy;
    this.collidingWithPaddle = false;
    this.collidingWithWall = false;
  }
}
