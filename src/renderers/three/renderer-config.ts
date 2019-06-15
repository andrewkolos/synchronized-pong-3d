import Three, { Vector3 } from 'three';

export interface Pong3dMeterConfig {
  scale: number;
  backColor: number;
  numberOfSegments: number;
  segmentColors: number[];
  maxValue: number;
}

export interface Pong3dScoreboardConfig {
  position: Vector3;
  scale: number;
  color: number;
  player1TextColor: number;
  player2TextColor: number;
  speedometer: Pong3dMeterConfig;
  serveMeter: Pong3dMeterConfig;
}

export interface Pong3dThreeRendererConfig {
  camera: {
    fov: number;
    clippingPlane: {
      near: number;
      far: number;
    },
    position: Three.Vector3;
  };
  width: number;
  height: number;
  playField: {
    color: number;
    centerlineColor: number;
  };
  paddles: {
    player1Color: number;
    player2Color: number;
  };
  scoreboard: Pong3dScoreboardConfig;
  screenShake: {
    minSpeed: number;
    maxSpeed: number;
    maxShake: number;
  };
  lighting: {
    directionalLight: {
      position: Three.Vector3;
      shadow: {
        near: number;
        far: number;
        left: number;
        right: number;
        top: number;
        bottom: number;
      },
      brightness: number;
    };
    scoreLight: {
      position: Three.Vector3;
      angle: number;
      distance: number;
      brightness: number;
    };
    hemisphericalLight: {
      position: Three.Vector3;
      brightness: number;
    };
    ambientLight: {
      brightness: number;
    };
  };
  wallColor: number;
  clearColor: number;
}
