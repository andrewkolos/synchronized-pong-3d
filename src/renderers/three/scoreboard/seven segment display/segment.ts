import Three, { Object3D } from 'three';
import { segWidth, segPad, segHeight } from './constants';

export class Segment {

  private object: Object3D;

  public constructor(private size: number, material: Three.Material) {
    const scale = this.scale;

    const segWidthPad = scale(segWidth - segPad);
    const segHeightPad = scale(segHeight - segPad);

    const geometry = new Three.Geometry();
    geometry.vertices.push( // Vertices in clockwise order.
      new Three.Vector3(-segWidthPad / 2, segHeightPad / 2, 0), // Top left.
      new Three.Vector3(segWidthPad / 2, segHeightPad / 2, 0), // Top right.
      new Three.Vector3(segWidthPad / 2 + segHeightPad / 2, 0, 0), // Right point.
      new Three.Vector3(segWidthPad / 2, -segHeightPad / 2, 0), // Bottom right.
      new Three.Vector3(-segWidthPad / 2, -segHeightPad /2, 0), // Bottom left.
      new Three.Vector3(-segWidthPad / 2 - segHeightPad / 2, 0, 0) // Left point.
    );
    geometry.faces.push(
      new Three.Face3(0, 1, 3),
      new Three.Face3(3, 4, 0),
      new Three.Face3(1, 2, 3),
      new Three.Face3(4, 5, 0)
    );
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    const segMesh = new Three.Mesh(geometry, material);
    segMesh.receiveShadow = true;

    this.object = segMesh;
  }

  public getObject() {
    return this.object;
  }

  private scale(x: number) {
    return x * this.size;
  }
}