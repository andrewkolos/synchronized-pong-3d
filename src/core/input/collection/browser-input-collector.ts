import * as Three from "three";
import { KeyboardManager } from "../../../keyboard";
import { Pong3dGameEngine } from "../../game-engine";
import { PaddleInput } from "../paddle-input";
import { Pong3dInputCollector } from "./input-collector";
import { KeyCode } from "./key-code";
import { Pong3DKeyMappings } from "./key-mappings";
import { InvalidMovementReason, PaddleMoveValidator } from "./paddle-move-validator";

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
    const input: PaddleInput = {
      dx: 0,
      dy: 0,
      dzRotation: 0,
    };

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

    const inputAfterValidation: PaddleInput = {
      dx: rawInput.dx,
      dy: rawInput.dy,
      dzRotation: rawInput.dzRotation,
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
