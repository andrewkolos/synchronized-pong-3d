import * as Three from "three";
import { PlaneFactory } from "../misc/plane-factory";
import { Pong3dMeterConfig } from "../renderer-config";

const METER_WIDTH = 8;
const METER_HEIGHT = 1.5;


export class Meter {

  private object: Three.Object3D = new Three.Object3D();
  private config: Pong3dMeterConfig;

  private meterParts: Three.Object3D[] = [];

  private planeFactory: PlaneFactory;

  public constructor(config: Pong3dMeterConfig) {
    this.config = config;
    const scale = this.scale.bind(this);

    this.planeFactory = new PlaneFactory(new Three.Euler(Math.PI / 2));

    const ballSpeedMeter = this.planeFactory.createPlane(scale(METER_WIDTH), scale(METER_HEIGHT), 0);
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
    const meterWidth = scale(METER_WIDTH);
    const meterHeight = scale(METER_HEIGHT);
    const spaceBetweenSegments = scale(0.2);

    const meterPartWidth = (meterWidth - spaceBetweenSegments) / this.config.numberOfSegments - spaceBetweenSegments;
    const meterPartHeight = meterHeight - spaceBetweenSegments * 2;

    const xPosOfFirstSegment = -(meterWidth / 2) + spaceBetweenSegments + meterPartWidth / 2;
    for (let i = 0; i < this.config.numberOfSegments; i++) {
      const part = this.planeFactory.createPlane(meterPartWidth, meterPartHeight, this.config.segmentColors[i]);
      part.position.x = xPosOfFirstSegment + (i * (meterPartWidth + spaceBetweenSegments));
      part.position.y = - 0.01;
      parts.push(part);

      part.visible = false;
    }

    return parts;
  }
}
