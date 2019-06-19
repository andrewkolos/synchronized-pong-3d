import { KeyboardManager } from "../../../keyboard";
import { Player } from "../../enum/player";
import { GameEngine } from "../../game-engine";
import { PaddleInput } from "../paddle-input";
import { KeyCode } from "./key-code";
import { KeyMappings } from "./key-mappings";
import { PaddleInputCollector } from "./paddle-input-collector";
import { InvalidMovementReason, PaddleInputValidator } from "./paddle-input-validator";

export interface BrowserInputCollectorContext {
  keyMappings: KeyMappings;
  game: GameEngine;
  player: Player;
}

/**
 * Collects inputs for a pong game using the browser.
 */
export class BrowserInputCollector implements PaddleInputCollector {

  private mappings: KeyMappings;
  private keyboardManager = new KeyboardManager();
  private game: GameEngine;
  private player: Player;

  constructor(context: BrowserInputCollectorContext) {
    this.mappings = context.keyMappings;
    this.game = context.game;
    this.player =  context.player;
  }

  /**
   * Creates an input message based on keyboard/gamepad inputs.
   * @param dt The number of milliseconds that this
   * @returns paddle move input
   */
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

    const moveSpeedPerMs = 0.006;
    const rotateSpeedPerMs = (Math.PI / 48 * 60) / 1000;

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
    const validationResult = PaddleInputValidator.validate(rawInput, this.game, this.player);

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
