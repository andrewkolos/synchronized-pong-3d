import * as Three from 'three';
import { Player, validatePlayerVal } from 'game-core/enum/player';
import { ThreeRendererConfig } from './renderer-config';

const player1Color = 0x0d47a1;
const player2Color = 0xb71c1c;
const scale = 1;
const meterBackColor = 0x11111;

export function makeSimpleThreeRendererConfig(width: number, height: number, player: Player): ThreeRendererConfig {
  validatePlayerVal(player);

  const p1CameraPosition = new Three.Vector3(0, -20, 10);
  const p1ScoreboardPosition = new Three.Vector3(0, 26, 2);

  const p1DirectionLightPos = new Three.Vector3(-7, -5, 8);
  const p2DirectionLightPos = p1DirectionLightPos.clone().multiply(new Three.Vector3(-1, -1, 1));

  return {
    camera: {
      fov: 45,
      clippingPlane: {
        near: 0.1,
        far: 1000,
      },
      position: reverseSidesIfP2Pov(p1CameraPosition, player),
    },
    width,
    height,
    walls: {
      width: 0.5,
      depth: 1,
    },
    playField: {
      color: 0x156289,
      centerlineColor: 0xffffff,
      centerlineWidth: 0.5,
      neutralZoneBoundaryWidth: 0.1,
      depth: 0.2,
    },
    paddles: {
      player1Color,
      player2Color,
    },
    scoreboard: {
      position: reverseSidesIfP2Pov(p1ScoreboardPosition, player),
      scale,
      color: 0xffffff,
      player1TextColor: player1Color,
      player2TextColor: player2Color,
      speedometer: {
        scale,
        backColor: meterBackColor,
        numberOfSegments: 7,
        segmentColors: [0x14a800, 0x49bb00, 0x7fcf00, 0xe9f500, 0xedb800, 0xf07b00, 0xf43d00],
        minValue: 0.12,
        maxValue: 0.4,
      },
      serveMeter: {
        scale,
        backColor: meterBackColor,
        numberOfSegments: 7,
        segmentColors: [0x777777, 0x888888, 0x999999, 0xaaaaaa, 0xbbbbbb, 0xdddddd, 0xffffff],
        minValue: 0,
        maxValue: 1,
      },
    },
    screenShake: {
      minSpeed: 0.3,
      maxSpeed: 1.0,
      maxShake: 0.2,
    },
    lighting: {
      directionalLight: {
        position: player === Player.Player1 ? p1DirectionLightPos : p2DirectionLightPos,
        shadow: {
          near: 4,
          far: 20,
          left: -7,
          right: 7,
          top: 12,
          bottom: -12,
        },
        brightness: 1,
      },
      scoreLight: {
        position: reverseSidesIfP2Pov(p1ScoreboardPosition.clone(), player).sub(
          reverseSidesIfP2Pov(new Three.Vector3(0, 10, 20), player),
        ),
        angle: 0.6,
        distance: 28,
        brightness: 2,
      },
      hemisphericalLight: {
        position: new Three.Vector3(0, 0, 10),
        brightness: 0.6,
      },
      ambientLight: {
        brightness: 0.1,
      },
    },
    wallColor: 0xffffff,
    clearColor: 0x000000,
  };
}

function reverseSidesIfP2Pov(pos: Three.Vector3, pov: Player) {
  validatePlayerVal(pov);
  if (pov === Player.Player2) {
    return pos.clone().multiply(new Three.Vector3(1, -1, 1));
  }
  return pos;
}
