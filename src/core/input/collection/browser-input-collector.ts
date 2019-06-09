import Three from 'three';
import { KeyboardManager } from '../../../keyboard';
import { Pong3dGameEngine } from '../../../core/game-engine';
import { PaddleInput } from '../paddle-input';
import { KeyCode } from './key-code';
import { Pong3DKeyMappings } from './key-mappings';
import { Pong3dInputCollector } from './input-collector';

export interface Pong3DBrowserInputCollectorContext {
  keyMappings: Pong3DKeyMappings;
  game: Pong3dGameEngine;
  playerPaddle: Three.Mesh;
}

export class Pong3dBrowserInputCollector implements Pong3dInputCollector {

  private mappings: Pong3DKeyMappings;
  private keyboardManager = new KeyboardManager();
  private game: Pong3dGameEngine;
  private playerPaddle: Three.Mesh;

  constructor(context: Pong3DBrowserInputCollectorContext) {
    this.mappings = context.keyMappings;
    this.game = context.game;
    this.playerPaddle = context.playerPaddle;
  }

  public getPaddleMoveInput(dt: number): PaddleInput {
    const rawInput = this.getInputFromControls(dt);
    const correctedInput = this.correctInput(rawInput);

    return correctedInput;
  }

  private getInputFromControls(dt: number): PaddleInput {
    let input: PaddleInput = {
      dx: 0,
      dy: 0,
      dzRotation: 0,
    }

    const moveSpeedPerMs = 0.009;
    const rotateSpeedPerMs = Math.PI / 0.00002083;

    if (this.isKeyDown(this.mappings.movePaddleBackward)) {
      input.dy += - moveSpeedPerMs * dt;
    }
    if (this.isKeyDown(this.mappings.movePaddleForward)) {
      input.dy += moveSpeedPerMs * dt;
    }
    if (this.isKeyDown(this.mappings.movePaddleRight)) {
      input.dx += moveSpeedPerMs * dt;
    }
    if (this.isKeyDown(this.mappings.movePaddleLeft)) {
      input.dx += - moveSpeedPerMs * dt;
    }

    if (this.isKeyDown(this.mappings.rotatePaddleLeft)) {
      input.dzRotation = rotateSpeedPerMs * dt;
    }
    if (this.isKeyDown(this.mappings.rotatePaddleRight)) {
      input.dzRotation = - rotateSpeedPerMs * dt;
    }

    return input;
  }

  private correctInput(rawInput: PaddleInput): PaddleInput {
    const validationResult = PaddleMoveValidator.validate(rawInput, this.game, this.playerPaddle);

    let inputAfterValidation: PaddleInput = {
      dx: rawInput.dx,
      dy: rawInput.dy,
      dzRotation: rawInput.dzRotation
    };

    if (validationResult.movementIsValid) {
      return rawInput;
    } else {
      const { invalidReasons } = validationResult;

      invalidReasons.forEach((reason: InvalidMovementReason) => {
        switch (reason) {
          case InvalidMovementReason.LeavingPlayField:
          case InvalidMovementReason.NeutralZoneInfraction:
            inputAfterValidation.dy = 0;
            break;
          case InvalidMovementReason.CollisionWithWall:
            inputAfterValidation.dx = 0;
            break;
        }
      });
    }

    return inputAfterValidation;
  }

  private isKeyDown(key: KeyCode) {
    return this.keyboardManager.isKeyDown(key.keyCode);
  }
}

enum InvalidMovementReason {
  CollisionWithWall,
  NeutralZoneInfraction,
  LeavingPlayField
}

interface MovementValidationResult {
  movementIsValid: boolean;
  invalidReasons: InvalidMovementReason[];
}

class PaddleMoveValidator {
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

  public static validate(inputToValidate: PaddleInput, game: Pong3dGameEngine,
    playerPaddle: Three.Mesh): MovementValidationResult {

    const validator = new PaddleMoveValidator(inputToValidate, game, playerPaddle);

    const invalidReasons: InvalidMovementReason[] = [];

    if (validator.isClippingWithWall()) invalidReasons.push(InvalidMovementReason.CollisionWithWall);
    if (validator.isLeavingPlayField()) invalidReasons.push(InvalidMovementReason.LeavingPlayField);
    if (validator.isViolatingNeutralZone()) invalidReasons.push(InvalidMovementReason.NeutralZoneInfraction);

    const movementIsValid = invalidReasons.length === 0;

    return {
      movementIsValid,
      invalidReasons
    };
  }

  private isClippingWithWall(): boolean {
    const isClippingWithEastWall = this.nextX > -(this.playFieldWidth / 2) + this.paddleWidth / 2;
    const isClippingWithWestWall = this.nextX < this.playFieldWidth / 2 - this.paddleWidth / 2;

    return isClippingWithEastWall || isClippingWithWestWall;
  }

  private isViolatingNeutralZone(): boolean {
    return this.nextY > -(this.neutralZoneHeight) / 2 &&
      this.nextY < this.playFieldHeight / 2;
  }

  private isLeavingPlayField(): boolean {
    const isLeavingFieldThroughBottom = this.nextY < -(this.playFieldHeight / 2) + (this.paddleHeight / 2);
    const isLeavingFieldThroughTop = this.nextY > (this.playFieldHeight / 2) - (this.paddleHeight / 2);

    return isLeavingFieldThroughBottom || isLeavingFieldThroughTop;
  }
}


