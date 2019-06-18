import * as Three from "three";
import { getWidthOfObject as getWidthOfObj } from "../misc/common";
import { Pong3dScoreboardConfig } from "../renderer-config";
import { Meter, METER_HEIGHT } from "./meter";
import { SevenSegmentDisplay } from "./seven segment display/seven-segment-display";

import font from "./helvetiker_regular.typeface.json";

export enum MeterType {
  ServeProgress,
  Speed,
}
export class Pong3dThreeScoreboard {

  private object: Three.Object3D;
  private font: Three.Font;
  private config: Pong3dScoreboardConfig;

  private speedometer: Meter;
  private serverMeter: Meter;

  private player1ScoreDisplay: SevenSegmentDisplay;
  private player2ScoreDisplay: SevenSegmentDisplay;

  public constructor(config: Pong3dScoreboardConfig) {

    const scale = this.scale.bind(this);

    this.object = new Three.Object3D();
    this.config = config;

    const width = scale(10);
    const height = scale(0.5);
    const depth = scale(5.25);
    const boardGeometry = new Three.BoxGeometry(width, height, depth, 32, 32, 32);
    const boardMaterial = new Three.MeshPhongMaterial({ color: config.color, opacity: 0.1 });
    const scoreboardBase = new Three.Mesh(boardGeometry, boardMaterial);

    scoreboardBase.castShadow = true;
    scoreboardBase.receiveShadow = true;

 //   this.object.add(scoreboardBase);

    const loader = new Three.FontLoader();
    this.font = loader.parse(font);

    const player1Mesh = this.generatePlayerTextMesh("P1", config.player1TextColor);
    player1Mesh.position.x = scale(-4);
    player1Mesh.position.y = scale(-0.25);
    player1Mesh.position.z = scale(0.80);

    const player2Mesh = this.generatePlayerTextMesh("P2", config.player2TextColor);
    player2Mesh.position.x = scale(0.25);
    player2Mesh.position.y = scale(-0.25);
    player2Mesh.position.z = scale(0.80);

    this.object.add(player1Mesh);
    this.object.add(player2Mesh);

    const speedometer = new Meter(config.speedometer);
    speedometer.getObject().position.set(0, scale(-0.5), scale(-0.9));
    this.object.add(speedometer.getObject());
    this.speedometer = speedometer;

    const serveMeter = new Meter(config.serveMeter);
    serveMeter.getObject().position.set(0, scale(-0.5), scale(-0.9));
    this.serverMeter = serveMeter;
    this.object.add(serveMeter.getObject());

    const player1ScoreDisplay = new SevenSegmentDisplay(config.scale, 2);
    const player1ScoreDisplayObj = player1ScoreDisplay.getObject();
    player1ScoreDisplayObj.scale.x *= METER_HEIGHT;
    player1ScoreDisplayObj.scale.y *= METER_HEIGHT;
    player1ScoreDisplayObj.position.x = - getWidthOfObj(player1ScoreDisplayObj) / 2 - scale(0.25);
    player1ScoreDisplayObj.position.y = scale(-1);
    player1ScoreDisplayObj.position.z = scale(1.3);
    this.player1ScoreDisplay = player1ScoreDisplay;
    this.object.add(player1ScoreDisplayObj);

    const player2ScoreDisplay = new SevenSegmentDisplay(config.scale, 2);
    const player2ScoreDisplayObj = player2ScoreDisplay.getObject();
    player2ScoreDisplayObj.scale.x *= METER_HEIGHT;
    player2ScoreDisplayObj.scale.y *= METER_HEIGHT;
    player2ScoreDisplayObj.position.x = scale(4) - getWidthOfObj(player2ScoreDisplayObj) / 2;
    player2ScoreDisplayObj.position.y = scale(-1);
    player2ScoreDisplayObj.position.z = scale(1.3);
    this.player2ScoreDisplay = player2ScoreDisplay;
    this.object.add(player2ScoreDisplayObj);

    this.object.position.copy(config.position);
  }

  public getObject(): Three.Object3D {
    return this.object;
  }

  public setSpeed(speed: number) {
    this.speedometer.setValue(speed);
  }

  public setServeProgress(progress: number) {
    this.serverMeter.setValue(progress);
  }

  public setScore(player1: number, player2: number) {
    this.player1ScoreDisplay.setNumber(player1);
    this.player2ScoreDisplay.setNumber(player2);
  }

  public showMeter(meter: MeterType) {
    const serveMeterShowing = meter === MeterType.ServeProgress;
    this.serverMeter.getObject().visible = serveMeterShowing;
    this.speedometer.getObject().visible = !serveMeterShowing;
  }

  private scale(x: number) {
    return this.config.scale * x;
  }

  private generatePlayerTextMesh(text: string, color: number) {
    const playerTextGeometry = new Three.TextGeometry(text, {
      font: this.font,
      size: this.config.scale,
      height: 0.25,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 8,
    });

    const playerScoreMaterial = new Three.MeshPhongMaterial({ color });
    const playerScoreMesh = new Three.Mesh(playerTextGeometry, playerScoreMaterial);
    playerScoreMesh.rotation.x = 90 * Math.PI / 180;
    playerScoreMesh.receiveShadow = true;
    playerScoreMesh.castShadow = true;

    return playerScoreMesh;
  }
}
