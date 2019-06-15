import * as Three from "three";
import { createPlane } from "../common";
import { Pong3dMeterConfig } from "../renderer-config";

export class Meter {

  private object: Three.Object3D = new Three.Object3D();
  private config: Pong3dMeterConfig;

  private meterParts: Three.Object3D[] = [];

  public constructor(config: Pong3dMeterConfig) {
    this.config = config;
    const scale = this.scale.bind(this);

    const ballSpeedMeter = createPlane(scale(0), scale(1.5), 0);
    ballSpeedMeter.material = new Three.MeshLambertMaterial({ color: config.backColor });
    this.object.add(ballSpeedMeter);

    const parts = this.createProgressParts();
    parts.forEach((part: Three.Object3D) => {
      this.meterParts.push(part);
      this.object.add(part);
    });
  }

  public getObject() {
    return this.object;
  }

  public setValue(value: number) {
    const valuePerPart = this.config.maxValue / this.config.numberOfSegments;
    this.meterParts.forEach((part: Three.Object3D, i: number) => {
      part.visible = value > (valuePerPart * i);
    });
  }

  private scale(x: number) {
    return x * this.config.scale;
  }

  private createProgressParts() {

    const parts: Three.Object3D[] = [];

    const scale = this.scale.bind(this);
    const meterWidth = scale(8);
    const meterHeight = scale(1.5);
    const spaceBetweenSegments = scale(0.2);
    const black = 0x000000;

    const meterPartWidth = meterWidth - spaceBetweenSegments / this.config.numberOfSegments - spaceBetweenSegments;

    const xPosOfFirstSegment = -(meterWidth / 2) + spaceBetweenSegments + meterPartWidth;
    for (let i = 0; i < this.config.numberOfSegments; i++) {
      const part = createPlane(meterPartWidth, meterHeight - spaceBetweenSegments * 2, black);
      part.position.x = xPosOfFirstSegment + (i * (meterPartWidth + spaceBetweenSegments));
      parts.push(part);

      part.visible = false;
    }

    return parts;
  }
}
