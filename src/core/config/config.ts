export interface Pong3dConfig {
  game: {
    tickRate: number;
  };
  playField: {
    width: number;
    height: number;
    neutralZoneHeight: number;
  };
  walls: {
    width: number;
    depth: number;
  };
  paddles: {
    width: number;
    height: number;
    depth: number;
    baseMoveSpeed: number;
  };
  ball: {
    radius: number;
    segmentCount: number;
    iFrames: number;
    speedLimit: number;
    speedIncreaseOnPaddleHit: number;
    maxDx: number;
    minDx: number;
    initDx: number;
    initDy: number;
  };
  pauseAfterScoreSec: number;
  aiPlayer?: {
    enabled: true;
    moveSpeed: number;
    speedIncreaseOnPaddleHit: number;
  };
}
