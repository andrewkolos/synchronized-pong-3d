import { getPaddleByPlayer } from "./common";
import { Player } from "./enum/player";
import { GameEngine } from "./game-engine";

export class AiController {

  public static move(game: GameEngine, player: Player) {
    if (game.config.aiPlayer == null) {
      throw Error("AI config is missing");
    }
    const ball = game.ball;
    const paddle = getPaddleByPlayer(game, player);
    const playfieldWidth = game.config.playField.width;
    const paddleWidth = game.config.paddles.width;
    const cpuMovespeed = game.config.aiPlayer.moveSpeed;

    if (ball.position.x > paddle.position.x) {
      if (paddle.position.x < playfieldWidth / 2 - paddleWidth / 2) {
        paddle.position.x += cpuMovespeed;
        if (ball.position.x < paddle.position.x) {
          paddle.position.x = ball.position.x;
        }
      }
    } else {
      if (paddle.position.x > -(playfieldWidth / 2) + paddleWidth / 2) {
        paddle.position.x -= cpuMovespeed;
        if (ball.position.x > paddle.position.x) {
          paddle.position.x = ball.position.x;
        }
      }
    }
  }

  private constructor() { }
}
