import * as Three from 'three';
import { segHeight, segPad, segWidth } from './constants';

export class Segment {
  private object: Three.Object3D;
  private material: Three.MeshBasicMaterial;

  public constructor(private size: number, color: number) {
    const scale = this.scale.bind(this);

    const segWidthPad = scale(segWidth - segPad);
    const segHeightPad = scale(segHeight - segPad);

    // Vertices in the segment shape, with the shape laying on its side and centered at the origin.
    // To understand the shape, set pads to 2 and draw these on graph paper.
    const topLeft = new Three.Vector3(-segWidthPad / 2, segHeightPad / 2, 0);
    const topRight = new Three.Vector3(segWidthPad / 2, segHeightPad / 2, 0);
    const right = new Three.Vector3(segWidthPad / 2 + segHeightPad / 2, 0, 0);
    const bottomRight = new Three.Vector3(segWidthPad / 2, -segHeightPad / 2, 0);
    const bottomLeft = new Three.Vector3(-segWidthPad / 2, -segHeightPad / 2, 0);
    const left = new Three.Vector3(-segWidthPad / 2 - segHeightPad / 2, 0, 0);

    const points: Three.Vector3[] = [
      left,
      topLeft,
      bottomLeft,

      topLeft,
      bottomLeft,
      topRight,

      bottomLeft,
      topRight,
      bottomRight,

      topRight,
      right,
      bottomRight,
    ];

    const geometry = new Three.BufferGeometry().setFromPoints(points);
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
