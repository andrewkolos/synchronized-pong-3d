import Three from "three";
import { Pong3dThreeRendererConfig } from "./renderer-config";

const player1Color = 0x0D47A1;
const player2Color = 0xB71c1c;
const scale = 1;
const meterBackColor = 0x11111;

export function generateSimpleThreeRendererConfig(width: number, height: number): Pong3dThreeRendererConfig {
  return {
    camera: {
      fov: 45,
      clippingPlane: {
        near: 0.1,
        far: 1000,
      },
      position: new Three.Vector3(0, -20, 10),
    },
    width,
    height,
    playField: {
      color: 0x156289,
      centerlineColor: 0xFFFFFF,
    },
    paddles: {
      player1Color,
      player2Color,
    },
    scoreboard: {
      position: new Three.Vector3(0, 26, 2),
      config: {
        scale,
        color: 0xFFFFFF,
        player1TextColor: player1Color,
        player2TextColor: player2Color,
        speedometer: {
          scale,
          backColor: meterBackColor,
          numberOfSegments: 7,
          segmentColors: [0x14a800, 0x49BB00, 0x7FCF00, 0xe9f500, 0xEDB800, 0xF07B00, 0xF43D00],
          maxValue: 1.2
        },
        serveMeter: {
          scale,
          backColor: meterBackColor,
          numberOfSegments: 7,
          segmentColors: [0x777777, 0x888888, 0x999999, 0xaaaaaa, 0xbbbbbb, 0xdddddd, 0xffffff],
          maxValue: 1
        }
      },
    },
    screenShake: {
      minSpeed: 0.55,
      maxSpeed: 1.4,
      maxShake: 0.2
    },
    lighting: {
      directionalLightBrightness: 1,
      scoreLightBrightness: 2,
      hemisphericalLightBrightness: 0.6,
      ambientLightBrightness: 0.1,
    },
    wallColor: 0xFFFFFF,
    clearColor: 0x000000
  }
}