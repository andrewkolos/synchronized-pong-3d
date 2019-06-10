import Three from 'three';

export interface Pong3dScoreboardConfig {
  position: Three.Vector3;
  size: {
    width: number;
    height: number;
    depth: number;
  };
  color: number;
  player1TextColor: number;
  player2TextColor: number;
  padding: number;
  speedometer: {
    backColor: number;
    speedColors: number[];
    serveColors: number[];
  }
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
  scoreboard: Pong3dScoreboardConfig;
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