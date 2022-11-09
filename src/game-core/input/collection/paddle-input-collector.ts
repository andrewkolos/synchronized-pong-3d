import { PaddleInput } from '../paddle-input';

/**
 * Generates inputs for a paddle in a pong game.
 */
export interface PaddleInputCollector {
  /**
   * Gets input for a paddle given an amount of time the controls
   * have been held in their current state.
   * @param dt The time, in milliseconds, that the device input has
   * had its current state for. A longer time will result in more
   * movement, assuming any device input is active.
   * @returns An input message, meant to represent the intent of the player,
   * how the state of the paddle should change and by how much.
   */
  getPaddleMoveInput(dt: number): PaddleInput;
}
