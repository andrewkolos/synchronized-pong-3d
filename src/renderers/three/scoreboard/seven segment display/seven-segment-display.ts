/* eslint-disable no-plusplus */
import * as Three from 'three';
import { segHeight, segWidth } from './constants';
import { Digit } from './digit';

export class SevenSegmentDisplay {
  private object: Three.Object3D;
  private digitCount: number;

  private digits: Digit[] = [];
  private invertedDigits: Digit[] = [];

  public constructor(size: number, digitCount: number) {
    const object = new Three.Object3D();

    this.object = object;
    this.digitCount = digitCount;

    const digitHeight = segHeight * 3 + segWidth * 2;
    const digitWidth = segWidth + segHeight * 2;
    const fullHeight = digitHeight + segHeight * 2;
    const fullWidth = segHeight + digitCount * (digitWidth + segHeight);

    for (let i = 0; i < digitCount; i++) {
      const digits = [0x00ff00, 0x222222].map((color: number) => {
        const digit = new Digit(size, color);
        digit.getObject().position.setX(-fullWidth / 2 + segHeight + digitWidth / 2 + i * (digitWidth + segHeight));
        return digit;
      });

      this.digits.push(digits[0]);
      this.invertedDigits.push(digits[1]);

      digits.forEach((d) => object.add(d.getObject()));
    }

    const backGeo = new Three.PlaneGeometry(fullWidth, fullHeight, 1, 1);
    const backMat = new Three.MeshLambertMaterial({ color: 1118481 });
    const backMesh = new Three.Mesh(backGeo, backMat);
    backMesh.position.z -= 0.01;
    object.add(backMesh);

    const bounds = new Three.Box3();
    bounds.setFromObject(object);
    const displayHeight = bounds.max.y - bounds.min.y;
    object.scale.x = 1 / displayHeight;
    object.scale.y = 1 / displayHeight;
    object.rotation.x = Math.PI / 2;

    this.setNumber(0);
  }

  public getObject() {
    return this.object;
  }

  public setNumber(n: number) {
    [this.digits, this.invertedDigits].forEach((array: Digit[]) => {
      let ncopy = n;
      let i = this.digitCount - 1;

      do {
        array[i--].setNumber(ncopy % 10);
        ncopy = (ncopy - (ncopy % 10)) / 10;
      } while (ncopy > 0 && i >= 0);

      while (i >= 0) {
        array[i--].clear();
      }
    });
    this.invertedDigits.forEach((digit: Digit) => {
      digit.invert();
    });
  }

  public invert(): void {
    for (let i = 0; i < this.digits.length; i++) {
      this.digits[i].invert();
      this.invertedDigits[i].invert();
    }
  }

  public clear(): void {
    [...this.digits, ...this.invertedDigits].forEach((digit: Digit) => {
      digit.clear();
    });
  }
}
