import * as Three from "three";
import { Pong3dGameEngine } from "../../game-engine";
import { PaddleInput } from "../paddle-input";

export enum InvalidMovementReason {
  CollisionWithWall,
  NeutralZoneInfraction,
  LeavingPlayField,
}

export interface MovementValidationResult {
  movementIsValid: boolean;
  invalidReasons: InvalidMovementReason[];
}

export class PaddleMoveValidator {
  public static validate(inputToValidate: PaddleInput, game: Pong3dGameEngine,
                         playerPaddle: Three.Mesh): MovementValidationResult {

    const validator = new PaddleMoveValidator(inputToValidate, game, playerPaddle);
    const invalidReasons: InvalidMovementReason[] = [];

    if (validator.isClippingWithWall()) {
      invalidReasons.push(InvalidMovementReason.CollisionWithWall);
    }
    if (validator.isLeavingPlayField()) {
      invalidReasons.push(InvalidMovementReason.LeavingPlayField);
    }
    if (validator.isViolatingNeutralZone()) {
      invalidReasons.push(InvalidMovementReason.NeutralZoneInfraction);
    }

    const movementIsValid = invalidReasons.length === 0;
    return {
      movementIsValid,
      invalidReasons,
    };
  }

  private playFieldWidth: number;
  private playFieldHeight: number;
  private neutralZoneHeight: number;
  private paddleWidth: number;
  private paddleHeight: number;
  private nextX: number;
  private nextY: number;

  private constructor(inputToValidate: PaddleInput, game: Pong3dGameEngine, playerPaddle: Three.Mesh) {
    this.playFieldWidth = game.config.playField.width;
    this.playFieldHeight = game.config.playField.height;
    this.neutralZoneHeight = game.config.playField.neutralZoneHeight;
    this.paddleWidth = game.config.paddles.width;
    this.paddleHeight = game.config.paddles.height;
    this.nextX = playerPaddle.position.x + inputToValidate.dx;
    this.nextY = playerPaddle.position.y + inputToValidate.dy;
  }

  private isClippingWithWall(): boolean {
    const isClippingWithEastWall = this.nextX <= -(this.playFieldWidth / 2) + this.paddleWidth / 2;
    const isClippingWithWestWall = this.nextX >= this.playFieldWidth / 2 - this.paddleWidth / 2;
    return isClippingWithEastWall || isClippingWithWestWall;
  }

  private isViolatingNeutralZone(): boolean {
    return this.nextY > -(this.neutralZoneHeight) / 2 - this.paddleWidth / 2 &&
      this.nextY < this.playFieldHeight / 2 + this.paddleWidth / 2;
  }

  private isLeavingPlayField(): boolean {
    const southBound = -(this.playFieldHeight / 2) + (this.paddleHeight / 2);
    const northBound = (this.playFieldHeight / 2) - (this.paddleHeight / 2);

    const isLeavingFieldThroughBottom = this.nextY <= southBound;
    const isLeavingFieldThroughTop = this.nextY >= northBound;

    return isLeavingFieldThroughBottom || isLeavingFieldThroughTop;
  }
}
