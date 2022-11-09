import { Player } from '../../enum/player';
import { GameEngine } from '../../game-engine';
import { PaddleInput } from '../paddle-input';
import { InvalidMovementReason, PaddleInputValidator } from './paddle-input-validator';

export class PaddleInputCorrector {
  public static correctInput(rawInput: PaddleInput, player: Player, gameState: GameEngine): PaddleInput {
    const validationResult = PaddleInputValidator.validate(rawInput, player, gameState);

    const inputAfterCorrection: PaddleInput = {
      dx: rawInput.dx,
      dy: rawInput.dy,
      dzRotation: rawInput.dzRotation,
    };

    if (validationResult.movementIsValid) {
      return rawInput;
    }
    const { invalidReasons } = validationResult;

    invalidReasons.forEach((reason: InvalidMovementReason) => {
      switch (reason) {
        case InvalidMovementReason.LeavingPlayField:
        case InvalidMovementReason.NeutralZoneInfraction:
          inputAfterCorrection.dy = 0;
          break;
        case InvalidMovementReason.CollisionWithWall:
          inputAfterCorrection.dx = 0;
          break;
        default:
          throw Error(`Unexpected InvalidMovementReason: ${reason}`);
      }
    });

    return inputAfterCorrection;
  }
}
