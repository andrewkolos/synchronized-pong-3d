import Three, { Vector3 } from 'three';

export interface MeterConfig {
  scale: number;
  backColor: number;
  numberOfSegments: number;
  segmentColors: number[];
  maxValue: number;
}

export interface ScoreboardConfig {
  position: Vector3;
  scale: number;
  color: number;
  player1TextColor: number;
  player2TextColor: number;
  speedometer: MeterConfig;
  serveMeter: MeterConfig;
}

export interface ThreeRendererConfig {
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
  walls: {
    width: number;
    depth: number;
  };
  playField: {
    color: number;
    centerlineColor: number;
    depth: number;
  };
  paddles: {
    player1Color: number;
    player2Color: number;
  };
  scoreboard: ScoreboardConfig;
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
