import Three from 'three';

export interface Pong3dSpeedometerConfig {
  size: number;
  backColor: number;
  numberOfSegments: number;
  speedSegmentColors: number[];
  minSpeedValue: number;
  maxSpeedValue: number;
}

export interface Pong3dScoreboardConfig {
  size: number;
  color: number;
  player1TextColor: number;
  player2TextColor: number;
  speedometer: Pong3dSpeedometerConfig;
}

export interface Pong3dThreeRendererConfig {
  camera: {
    viewAngle: number;
    aspectRatio: number;
    clippingPlane: {
      near: number;
      far: number;
    },
    position: Three.Vector3;
  }
  width: number;
  height: number;
  playField: {
    color: number;
    centerlineColor: number;
  }
  paddles: {
    player1Color: number;
    player2Color: number;
  }
  scoreboard: {
    position: Three.Vector3;
    config: Pong3dScoreboardConfig;
  }
  screenShake: {
    minSpeed: number;
    maxSpeed: number;
    maxShake: number;
  },
  lighting: {
    directionalLightBrightness: number;
    scoreLightBrightness: number;
    hemisphericalLightBrightness: number;
    ambientLightBrightness: number;
  },
  clearColor: number;
}