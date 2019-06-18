import * as Three from "three";
import { Player } from "../enum/player";
import { Pong3dGameEngine } from "../game-engine";
import { PlayerBoundPaddleInput } from "./player-bound-paddle-input";

/* Applies input to a Pong 3d game. */
export class Pong3dInputApplicator {
  constructor(private game: Pong3dGameEngine) {}

  public applyInput(input: PlayerBoundPaddleInput) {
    const paddle = this.getPlayersPaddle(input.player);

    paddle.position.add(new Three.Vector2(input.dx, input.dy));
    paddle.velocity.setX(input.dx).setY(input.dy);
    paddle.zRotationRads += input.dzRotation;
  }

  private getPlayersPaddle(player: Player) {
    return player === Player.Player1 ? this.game.player1Paddle : this.game.player2Paddle;
  }
}
