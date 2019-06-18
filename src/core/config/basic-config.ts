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
    baseMoveSpeed: 0.6 * 1.5,
  },
  ball: {
    radius: 0.45,
    segmentCount: 64,
    iFrames: 15,
    speedLimit: 1,
    speedIncreaseOnPaddleHit: 0.5,
    maxDx: 0.14,
    minDx: 0.04,
    initDx: 0.08,
    initDy: 0.10,
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
