import { getPaddleByPlayer } from "core/common";
import * as Three from "three";
import { Player } from "../enum/player";
import { GameEngine } from "../game-engine";
import { PlayerBoundPaddleInput } from "./player-bound-paddle-input";

/* Applies (player) paddle input to a Pong 3d game. */
export class PaddleInputApplicator {

  public static applyInput(game: GameEngine, input: PlayerBoundPaddleInput) {
    const paddle = getPaddleByPlayer(game, input.player);

    paddle.position.add(new Three.Vector2(input.dx, input.dy));
    paddle.velocity.setX(input.dx).setY(input.dy);
    paddle.zRotationEulers += input.dzRotation;
  }

  constructor(private game: GameEngine) {}

  /**
   * Applies an input to a game instance.
   * @param input The input to apply to a paddle.
   */
  public applyInput(input: PlayerBoundPaddleInput) {
    PaddleInputApplicator.applyInput(this.game, input);
  }

  private getPlayersPaddle(player: Player) {
    return player === Player.Player1 ? this.game.player1Paddle : this.game.player2Paddle;
  }
}
