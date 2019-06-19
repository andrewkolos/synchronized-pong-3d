import { Config } from "./config";

export const basicConfig: Config = {
  game: {
    tickRate: 60,
  },
  playField: {
    width: 10,
    height: 20,
    neutralZoneHeight: 0.5,
  },
  paddles: {
    width: 2,
    height: 0.125,
    depth: 1,
    baseMoveSpeedPerMs: 0.006,
  },
  ball: {
    radius: 0.45,
    speedLimit: 1,
    speedIncreaseOnPaddleHitRatio: 0.5,
    initialSpeedOnServe: 0.1,
  },
  pauseAfterScoreSec: 2,
};

export const basicConfigWithAiOpponent: Config = {
  ...basicConfig,
  aiPlayer: {
    enabled: true,
    moveSpeed: 0.06 * 2.1,
    speedIncreaseOnPaddleHit: 0.02,
  }
};
