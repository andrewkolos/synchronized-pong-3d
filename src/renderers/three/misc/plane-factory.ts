import * as Three from "three";

export class PlaneFactory {

  private rotation: Three.Euler;
  public constructor(rotation: Three.Euler) {
    this.rotation = rotation;
  }

  public createPlane(width: number, height: number, color: number) {
  const geometry = new Three.PlaneGeometry(width, height, 12, 12);
  const material = new Three.MeshBasicMaterial({ color });
  const mesh = new Three.Mesh(geometry, material);
  mesh.rotation.copy(this.rotation);
  return mesh;
}
}