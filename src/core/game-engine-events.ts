import { Player } from "./enum/player";

export interface Pong3dGameEngineEvents {
  ballHitPaddle: void;
  ballHitWall: void;
  playerScored: (scorer: Player, score: {player1: number, player2: number}) => void;
}
