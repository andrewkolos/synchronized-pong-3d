import { Player } from './enum/player';
export interface Pong3dGameEngineEvents {
  ballHitPaddle: void;
  ballHitWall: void;
  playerScored: Player;
}
