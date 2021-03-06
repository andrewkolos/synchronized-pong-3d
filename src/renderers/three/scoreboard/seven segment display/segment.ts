import * as Three from "three";
import { segHeight, segPad, segWidth } from "./constants";

export class Segment {

  private object: Three.Object3D;
  private material: Three.MeshBasicMaterial;

  public constructor(private size: number, color: number) {

    const scale = this.scale.bind(this);

    const segWidthPad = scale(segWidth - segPad);
    const segHeightPad = scale(segHeight - segPad);

    const geometry = new Three.Geometry();
    geometry.vertices.push( // Vertices in clockwise order.
      new Three.Vector3(-segWidthPad / 2, segHeightPad / 2, 0), // Top left.
      new Three.Vector3(segWidthPad / 2, segHeightPad / 2, 0), // Top right.
      new Three.Vector3(segWidthPad / 2 + segHeightPad / 2, 0, 0), // Right point.
      new Three.Vector3(segWidthPad / 2, -segHeightPad / 2, 0), // Bottom right.
      new Three.Vector3(-segWidthPad / 2, -segHeightPad / 2, 0), // Bottom left.
      new Three.Vector3(-segWidthPad / 2 - segHeightPad / 2, 0, 0), // Left point.
    );
    geometry.faces.push(
      new Three.Face3(0, 1, 3),
      new Three.Face3(3, 4, 0),
      new Three.Face3(1, 2, 3),
      new Three.Face3(4, 5, 0),
    );
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    this.material = new Three.MeshBasicMaterial({ color });
    this.material.side = Three.DoubleSide;
    const segMesh = new Three.Mesh(geometry, this.material);
    segMesh.receiveShadow = true;

    this.object = segMesh;
  }

  public getObject() {
    return this.object;
  }

  public setColor(color: number): void {
    this.material.color = new Three.Color(color);
  }

  private scale(x: number) {
    return x * this.size;
  }
}
