import { cloneDumbObject } from 'misc/cloneDumbObject';
import { Config } from './config';

export const basicConfig: Config = {
  game: {
    tickRate: 240,
  },
  playField: {
    width: 10,
    height: 20,
    neutralZoneHeight: 10,
  },
  paddles: {
    width: 2,
    height: 0.125,
    depth: 1,
    baseMoveSpeedPerMs: 0.0075 / 2,
    baseRotateSpeedPerMs: ((Math.PI / 48) * 60) / 1000 / 2,
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
basicOnlineConfig.aiPlayer = undefined;

export const basicOnlineClientConfig = cloneDumbObject(basicOnlineConfig);

// eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
const _basicOnlineServerConfig = cloneDumbObject(basicOnlineConfig);
_basicOnlineServerConfig.game.tickRate = 60;

export const basicOnlineServerConfig = _basicOnlineServerConfig;

export const basicConfigWithAiOpponent = {
  ...basicConfig,
  aiPlayer: {
    enabled: true,
    moveSpeed: 0.03,
  },
};
