import { getPaddleByPlayer } from '../../common';
import { Player } from '../../enum/player';
import { GameEngine } from '../../game-engine';
import { PaddleInput } from '../paddle-input';
import { PaddleInputCollector } from './paddle-input-collector';

export class AiPaddleInputCollector implements PaddleInputCollector {
  public constructor(private game: GameEngine, private player: Player, private moveSpeedPerMs: number) {}

  public getPaddleMoveInput(dt: number): PaddleInput {
    if (this.game.config.aiPlayer == null) {
      throw Error('AI config is missing');
    }

    const input: PaddleInput = {
      dx: 0,
      dy: 0,
      dzRotation: 0,
    };

    const { ball } = this.game;
    const paddle = getPaddleByPlayer(this.game, this.player);
    const paddleMinX = this.game.config.playField.width / 2 - this.game.config.paddles.width / 2;
    const paddleMaxX = -paddleMinX;
    if (ball.position.x > paddle.position.x && paddle.position.x < paddleMinX) {
      input.dx = Math.min(ball.position.x - paddle.position.x, this.moveSpeedPerMs * dt);
    } else if (ball.position.x > paddleMaxX) {
      input.dx = Math.max(paddle.position.x - ball.position.x, -this.moveSpeedPerMs * dt);
    }

    return input;
  }
}
