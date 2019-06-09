
/**
 * Contains data representing an intent to move a paddle a certain distance.
 */
export interface PaddleInput {
  dx: number;
  dy: number;
  dzRotation: number;
}