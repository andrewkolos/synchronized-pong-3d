import { getPaddleByPlayer } from "./common";
import { Player } from "./enum/player";
import { GameEngine } from "./game-engine";

export class AiController {

  public static move(game: GameEngine, player: Player) {
    if (game.config.aiPlayer == null) {
      throw Error("AI config is missing");
    }
    // tslint:disable-next-line: no-shadowed-variable
    const ball = game.ball;
    const paddle = getPaddleByPlayer(game, player);
    const paddleMinX = game.config.playField.width / 2 - game.config.paddles.width / 2;
    const paddleMaxX = -paddleMinX;
    if (ball.position.x > paddle.position.x && paddle.position.x < paddleMinX) {
      paddle.position.x += game.config.aiPlayer.moveSpeed;
      if (ball.position.x < paddle.position.x) {
        paddle.position.x = ball.position.x;
      }
    } else if (ball.position.x > paddleMaxX) {
      paddle.position.x -= game.config.aiPlayer.moveSpeed;
      if (ball.position.x > paddle.position.x) {
        paddle.position.x = ball.position.x;
      }
    }
  }

  private constructor() {}
}
