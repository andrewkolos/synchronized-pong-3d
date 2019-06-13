import { Player } from "./enum/player";

export interface Pong3dGameEngineEvents {
  tick: () => void;
  startingServe: () => void;
  ballServed: () => void;
  ballHitPaddle: () => void;
  ballHitWall: () => void;
  playerScored: (scorer: Player, score: {player1: number, player2: number}) => void;
}
