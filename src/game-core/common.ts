import { Player, validatePlayerVal } from "./enum/player";
import { GameEngine } from "./game-engine";
import { Paddle } from "./paddle";

export function getPaddleByPlayer(game: GameEngine, player: Player): Paddle {
  validatePlayerVal(player);
  return player === Player.Player1 ? game.player1Paddle : game.player2Paddle;
}

export function getPlayerByPaddle(game: GameEngine, paddle: Paddle): Player {
  switch (paddle) {
    case game.player1Paddle:
      return Player.Player1;
    case game.player2Paddle:
      return Player.Player2;
    default:
      throw Error("Paddle does not belong to either player.");
  }
}