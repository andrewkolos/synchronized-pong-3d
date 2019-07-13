import { ResponsiveGamepad, ResponsiveGamepadState } from "responsive-gamepad";
import { getPaddleByPlayer } from "../../../common";
import { Player } from "../../../enum/player";
import { GameEngine } from "../../../game-engine";
import { PaddleInput } from "../../paddle-input";
import { KeyCode } from "../key-code";
import { KeyMappings } from "../key-mappings";
import { PaddleInputCollector } from "../paddle-input-collector";
import { PaddleInputCorrector } from "../paddle-input-corrector";
import { KeyboardManager } from "../../keyboard";

export interface BrowserInputCollectorContext {
  keyMappings: KeyMappings;
  game: GameEngine;
  player: Player;
  playerMoveSpeedPerMs: number;
  playerRotateSpeedPerMs: number;
  disableGamepad?: boolean;
}

const GAMEPAD_STICK_DEAD_ZONE_END = 0.1;
/**
 * Collects inputs for a pong game using the browser.
 */
export class BrowserInputCollector implements PaddleInputCollector {

  private mappings: KeyMappings;
  private keyboardManager = new KeyboardManager();
  private game: GameEngine;
  private player: Player;
  private playerMoveSpeedPerMs: number;
  private playerRotateSpeedPerMs: number;

  private gamepadDisabled: boolean;

  constructor(context: BrowserInputCollectorContext) {
    this.mappings = context.keyMappings;
    this.game = context.game;
    this.player =  context.player;
    this.playerMoveSpeedPerMs = context.playerMoveSpeedPerMs;
    this.playerRotateSpeedPerMs = context.playerRotateSpeedPerMs;
    this.gamepadDisabled = context.disableGamepad === false ? false : true;

    ResponsiveGamepad.enable();
  }

  /**
   * Creates an input message based on keyboard/gamepad inputs.
   * @param dt The number of milliseconds representing how long the user has been
   * holding the currently activated inputs for.
   * @returns An input message for a paddle.
   */
  public getPaddleMoveInput(dt: number): PaddleInput {
    const rawInput = this.getInputFromControls(dt);
    const correctedInput = PaddleInputCorrector.correctInput(rawInput, this.player, this.game);

    return correctedInput;
  }

  private getInputFromControls(dt: number): PaddleInput {

    // We prefer the keyboard, if the user is using it.
    if (this.isKeyboardActive()) {
      return this.getInputFromKeyboard(dt);
    } else if (!this.gamepadDisabled) {
      return this.getInputFromGamepad(dt);
    } else {
      return {
        dx: 0,
        dy: 0,
        dzRotation: 0,
      };
    }
  }

  private isKeyboardActive(): boolean {
    return Object.values(this.mappings).some((key: KeyCode) => {
      return this.isKeyDown(key);
    });
  }

  private getInputFromGamepad(dt: number): PaddleInput {
    const inputState = ResponsiveGamepad.getState() as ResponsiveGamepadState;

    // Note: Horizontal => right is positive. Vertical: down is positive.
    const positionHorizontalAxis = inputState.LEFT_ANALOG_HORIZONTAL_AXIS;
    const positionVerticalAxis = inputState.LEFT_ANALOG_VERTICAL_AXIS;
    const rotationHorizontalAxis = inputState.RIGHT_ANALOG_HORIZONTAL_AXIS;
    const rotationVerticalAxis = inputState.RIGHT_ANALOG_VERTICAL_AXIS;

    const deadZoneEnd = GAMEPAD_STICK_DEAD_ZONE_END;

    const desiredRotationOfPaddle = Math.atan2(-rotationVerticalAxis, rotationHorizontalAxis) - Math.PI / 2;
    const currentRotationOfPaddle = getPaddleByPlayer(this.game, this.player).zRotationEulers;
    const dzRotation = desiredRotationOfPaddle - currentRotationOfPaddle;

    return {
      dx: Math.abs(positionHorizontalAxis) > deadZoneEnd ? positionHorizontalAxis * this.playerMoveSpeedPerMs * dt : 0,
      dy: Math.abs(positionVerticalAxis) > deadZoneEnd ? - positionVerticalAxis * this.playerMoveSpeedPerMs * dt : 0,
      dzRotation: Math.abs(Math.hypot(rotationHorizontalAxis, -rotationVerticalAxis)) > deadZoneEnd ? dzRotation : 0,
    };

  }

  private getInputFromKeyboard(dt: number): PaddleInput {
    const input: PaddleInput = {
      dx: 0,
      dy: 0,
      dzRotation: 0,
    };

    const moveSpeedPerMs = this.playerMoveSpeedPerMs;
    const rotateSpeedPerMs = this.playerRotateSpeedPerMs;

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

  private isKeyDown(key: KeyCode) {
    return this.keyboardManager.isKeyDown(key.keyCode);
  }
}
