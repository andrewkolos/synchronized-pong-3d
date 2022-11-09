import * as Three from 'three';
import { getPaddleByPlayer, getPlayerByPaddle } from './common';
import { BallConfig } from './config/config';
import { Player, validatePlayerVal } from './enum/player';
import { GameEngine } from './game-engine';
import { Paddle } from './paddle';

enum CollisionType {
  None,
  Standard,
  LeftEdge,
  RightEdge,
}

export class Ball {
  /** The distanced traveled by the ball per game tick. */
  public velocity: Three.Vector2;
  public readonly radius: number;
  public position: Three.Vector2;
  public onWallBounce?: () => void;
  public onPaddleBounce?: (player: Player) => void;

  public collisionEnabled: boolean;

  private collidingWithPaddle: boolean;
  private game: GameEngine;

  public constructor(game: GameEngine, config: BallConfig) {
    this.game = game;
    this.radius = config.radius;
    this.velocity = new Three.Vector2();
    this.position = new Three.Vector2();
    this.collidingWithPaddle = false;
    this.collisionEnabled = true;
  }

  /**
   * Moves ball using its current velocity and position/orientation of
   * the game's paddles and walls.
   */
  public advance() {
    const { game } = this;

    const positionDelta = this.getDelta();
    this.position.add(positionDelta);

    const collisionInfo = this.isCollidingWithAnyPaddle();
    if (this.isCollidingWithWall()) {
      this.handleCollisionWithWall();
      if (this.onWallBounce != null) {
        this.onWallBounce();
      }
    } else if (collisionInfo.player != null && collisionInfo.collisionType !== CollisionType.None) {
      const delta = new Three.Vector2(this.velocity.x, this.velocity.y);
      const paddle = getPaddleByPlayer(game, collisionInfo.player);

      const rot = paddle.zRotationEulers;

      if (collisionInfo.collisionType === CollisionType.Standard) {
        delta.x -= paddle.velocity.x * game.config.ball.speedIncreaseOnPaddleHitRatio;
        delta.y -= paddle.velocity.y * game.config.ball.speedIncreaseOnPaddleHitRatio;

        delta.rotateAround(new Three.Vector2(0, 0), -rot);

        delta.y *= -1;
        delta.rotateAround(new Three.Vector2(0, 0), rot);

        delta.multiplyScalar((delta.length() + game.config.ball.baseSpeedIncreaseOnPaddleHit) / delta.length());
      } else if (collisionInfo.player !== Player.Player2 || game.config.aiPlayer == null) {
        delta.x = Math.hypot(delta.x, delta.y);
        delta.y = 0;
        delta.rotateAround(new Three.Vector2(), collisionInfo.collisionType === CollisionType.RightEdge ? rot : rot);

        if (collisionInfo.collisionType === CollisionType.LeftEdge) {
          delta.multiplyScalar(-1);
        }
      }

      // Prevent double-counted collision from the paddle traveling into the ball.
      //this.position.add(new Three.Vector2(paddle.velocity.x, paddle.velocity.y));

      this.velocity.set(delta.x, delta.y);
      this.position.add(this.velocity);

      if (this.onPaddleBounce != null) {
        this.onPaddleBounce(collisionInfo.player);
      }
    }
  }

  /**
   * Teleports the ball to directly in front of a player's paddle.
   * @param player The player that the ball should teleport to.
   */
  public teleportToPlayer(player: Player) {
    validatePlayerVal(player);

    const ballRadius = this.radius;

    const paddle = getPaddleByPlayer(this.game, player);
    const paddleHeight = paddle.height;
    const ballYPosOffsetPlayer1 = paddleHeight / 2 + ballRadius * 2; // Move the ball in front of the paddle.
    const ballYPosOffsetPlayer2 = -ballYPosOffsetPlayer1;

    const ballYPosOffset = player === Player.Player1 ? ballYPosOffsetPlayer1 : ballYPosOffsetPlayer2;

    this.position.x = paddle.position.x + ballYPosOffset * Math.cos(paddle.zRotationEulers + Math.PI / 2);
    this.position.y = paddle.position.y + ballYPosOffset * Math.sin(paddle.zRotationEulers + Math.PI / 2);
  }

  /**
   * Sets the ball's velocity to travel towards a player's paddle at a given speed.
   * @param player The player that the ball should start traveling towards.
   * @param speed The speed that the ball should travel at.
   */
  public sendTowardPlayer(player: Player, speed: number) {
    const servingPaddleObj = getPaddleByPlayer(this.game, player);
    this.velocity.x = speed * Math.cos(servingPaddleObj.zRotationEulers - Math.PI / 2);
    this.velocity.y = speed * Math.sin(servingPaddleObj.zRotationEulers - Math.PI / 2);
  }

  public isCollidingWithWall(): boolean {
    const playFieldWidth = this.game.config.playField.width;
    return this.position.x < -(playFieldWidth / 2) + this.radius || this.position.x > playFieldWidth / 2 - this.radius;
  }

  public isCollidingWithAnyPaddle() {
    let player: Player | undefined;
    let collisionType: CollisionType = CollisionType.None;

    [this.game.player1Paddle, this.game.player2Paddle].forEach((p: Paddle) => {
      const c = this.isCollidingWithPaddle(p);
      if (c !== CollisionType.None) {
        player = getPlayerByPaddle(this.game, p);
        collisionType = c;
      }
    });

    this.game.ball.collidingWithPaddle = player != null;
    return {
      player,
      collisionType,
    };
  }

  public isCollidingWithPaddle(paddle: Paddle) {
    const paddleWidth = this.game.config.paddles.width;
    const paddleHeight = this.game.config.paddles.height;

    const origin = new Three.Vector2(0, 0);
    const ballRelPos = this.getRelativePosition(this, paddle);
    const ballRelPosDisregardingRotation = ballRelPos.rotateAround(origin, -paddle.zRotationEulers);

    const xDiff = Math.abs(ballRelPosDisregardingRotation.x) - this.radius;
    const yDiff = Math.abs(ballRelPosDisregardingRotation.y) - this.radius;

    if (xDiff < paddleWidth / 2 && yDiff < paddleHeight && !this.collidingWithPaddle) {
      if (Math.abs(xDiff) > (paddleWidth / 2) * 0.7 && Math.abs(yDiff) < this.radius) {
        if (ballRelPos.x > 0) {
          return CollisionType.RightEdge;
        }
        return CollisionType.LeftEdge;
      }
      return CollisionType.Standard;
    }
    return CollisionType.None;
  }

  private getDelta() {
    const correctionFactor = 60 / this.game.config.game.tickRate;
    const speedLimit = this.game.config.ball.speedLimit * correctionFactor;

    const positionDelta = this.game.ball.velocity.clone().multiplyScalar(correctionFactor);
    const distanceTraveled = positionDelta.length();
    if (distanceTraveled > speedLimit) {
      positionDelta.normalize().multiplyScalar(speedLimit / correctionFactor);
      this.game.ball.velocity.x = positionDelta.x;
      this.game.ball.velocity.y = positionDelta.y;
    }

    return positionDelta;
  }

  private handleCollisionWithWall() {
    const ballIsAlreadyTravelingAwayFromWall = Math.sign(this.velocity.x) !== Math.sign(this.position.x);
    if (!ballIsAlreadyTravelingAwayFromWall) {
      this.velocity.x *= -1;
    }
  }

  private getRelativePosition(ball: Ball, paddle: Paddle) {
    const relXPos = ball.position.x - paddle.position.x;
    const relYPos = ball.position.y - paddle.position.y;

    return new Three.Vector2(relXPos, relYPos);
  }
}
