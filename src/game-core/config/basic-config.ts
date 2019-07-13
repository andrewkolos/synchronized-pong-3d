import { Config } from "./config";
import { cloneDumbObject } from 'misc/cloneDumbObject';

export const basicConfig: Config = {
  game: {
    tickRate: 240,
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
    baseMoveSpeedPerMs: 0.0075,
    baseRotateSpeedPerMs: (Math.PI / 48 * 60) / 1000,
  },
  ball: {
    radius: 0.45,
    speedLimit: 1,
    speedIncreaseOnPaddleHitRatio: 0.45,
    baseSpeedIncreaseOnPaddleHit: 0.01,
    initialSpeedOnServe: 0.12,
  },
  pauseAfterScoreSec: 2,
};

const basicOnlineConfig = cloneDumbObject(basicConfig);
basicConfig.paddles.baseMoveSpeedPerMs /= 2;
basicConfig.paddles.baseRotateSpeedPerMs /= 2;

export const basicOnlineClientConfig = cloneDumbObject(basicOnlineConfig);

const _basicOnlineServerConfig = cloneDumbObject(basicOnlineConfig);
_basicOnlineServerConfig.game.tickRate = 60;

export const basicOnlineServerConfig = _basicOnlineServerConfig;

export const basicConfigWithAiOpponent = {
  ...basicConfig,
  aiPlayer: {
    enabled: true,
    moveSpeed: 0.06 * 2.1,
  },
};
