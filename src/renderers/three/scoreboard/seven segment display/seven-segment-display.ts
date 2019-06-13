import Three from "three";
import { segHeight, segWidth } from "./constants";
import { Digit } from "./digit";

export class SevenSegmentDisplay {

  private object: Three.Object3D;
  private digitCount: number;

  private digits: Digit[] = [];

  public constructor(size: number, digitCount: number) {
    const object = new Three.Object3D();

    this.object = object;
    this.digitCount = digitCount;

    const digitWidth = segWidth + segHeight * 2;

    for (let i = 0; i < digitCount; i++) {
      const digit = new Digit(size);
      this.digits.push(digit);
      object.add(digit.getObject());
      digit.getObject().position.set(i * (digitWidth + segHeight), 0, 0);
    }

    const bounds = new Three.Box3();
    bounds.setFromObject(object);
    const displayHeight = bounds.max.y - bounds.min.y;
    object.scale.x = 1 / displayHeight;
    object.scale.y = 1 / displayHeight;
  }

  public getObject() {
    return this.object;
  }

  public setNumber(n: number) {
    let i = this.digitCount - 1;
    do {
      this.digits[i--].setNumber(n % 10);
      n = (n - n % 10) / 10;
    } while (n > 0 && i >= 0);

    while (i >= 0) {
      this.digits[i--].clear();
    }
  }

  public invert(): void {
    this.digits.forEach((digit: Digit) => {
      digit.invert();
    });
  }

  public clear(): void {
    this.digits.forEach((digit: Digit) => {
      digit.clear();
    });
  }
}
