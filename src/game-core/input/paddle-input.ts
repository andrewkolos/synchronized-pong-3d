/**
 * Contains data representing an intent to move a paddle a certain distance.
 */
export interface PaddleInput {
  dx: number;
  dy: number;
  dzRotation: number;
}

export const NullPaddleInput: PaddleInput = {
  dx: 0,
  dy: 0,
  dzRotation: 0,
};
