export interface BallConfig {
  radius: number;
  segmentCount: number;
  iFrames: number;
  speedLimit: number;
  speedIncreaseOnPaddleHit: number;
  maxDx: number;
  minDx: number;
  initDx: number;
  initDy: number;
}

export interface Config {
  game: {
    tickRate: number;
  };
  playField: {
    width: number;
    height: number;
    neutralZoneHeight: number;
  };
  paddles: {
    width: number;
    height: number;
    depth: number;
    baseMoveSpeed: number;
  };
  ball: BallConfig;
  pauseAfterScoreSec: number;
  aiPlayer?: {
    enabled: true;
    moveSpeed: number;
    speedIncreaseOnPaddleHit: number;
  };
}
