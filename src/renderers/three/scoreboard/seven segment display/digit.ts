import * as Three from 'three';
import { segHeight, segWidth } from './constants';
import { Segment } from './segment';

const segmentStates = [
  [false, true, true, true, true, true, true],
  [false, false, false, true, true, false, false],
  [true, false, true, true, false, true, true],
  [true, false, true, true, true, true, false],
  [true, true, false, true, true, false, false],
  [true, true, true, false, true, true, false],
  [true, true, true, false, true, true, true],
  [false, false, true, true, true, false, false],
  [true, true, true, true, true, true, true],
  [true, true, true, true, true, true, false],
];

export class Digit {
  private object: Three.Object3D;
  private segments: Three.Object3D[] = [];
  public constructor(size: number, color: number) {
    this.object = new Three.Object3D();
    for (let i = 0; i < 7; i++) {
      const segment = new Segment(size, color).getObject();
      this.segments.push(segment);
      this.object.add(segment);
    }
    const halfSegment = segHeight / 2 + segWidth / 2;
    this.segments[1].position.set(-halfSegment, halfSegment, 0);
    this.segments[1].rotation.z = Math.PI / 2;
    this.segments[2].position.set(0, halfSegment * 2, 0);
    this.segments[3].position.set(halfSegment, halfSegment, 0);
    this.segments[3].rotation.z = Math.PI / 2;
    this.segments[4].position.set(halfSegment, -halfSegment, 0);
    this.segments[4].rotation.z = Math.PI / 2;
    this.segments[5].position.set(0, -halfSegment * 2, 0);
    this.segments[6].position.set(-halfSegment, -halfSegment, 0);
    this.segments[6].rotation.z = Math.PI / 2;

    this.setNumber(0);
  }

  public getObject() {
    return this.object;
  }

  public setNumber(n: number) {
    this.segments.forEach((segment: Three.Object3D, index: number) => {
      segment.visible = segmentStates[n][index];
    });
  }

  public invert() {
    this.segments.forEach((segment: Three.Object3D) => {
      segment.visible = !segment.visible;
    });
  }

  public clear() {
    this.segments.forEach((segment: Three.Object3D) => {
      segment.visible = false;
    });
  }
}
