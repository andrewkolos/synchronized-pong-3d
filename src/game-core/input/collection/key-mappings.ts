import { KeyCode } from './key-code';

export interface KeyMappings {
  movePaddleLeft: KeyCode;
  movePaddleRight: KeyCode;
  movePaddleForward: KeyCode;
  movePaddleBackward: KeyCode;
  rotatePaddleLeft: KeyCode;
  rotatePaddleRight: KeyCode;
}

export const simpleP1KeyMappings: KeyMappings = {
  movePaddleForward: KeyCode.fromKeyName('w'),
  movePaddleLeft: KeyCode.fromKeyName('a'),
  movePaddleBackward: KeyCode.fromKeyName('s'),
  movePaddleRight: KeyCode.fromKeyName('d'),
  rotatePaddleLeft: KeyCode.fromKeyName('q'),
  rotatePaddleRight: KeyCode.fromKeyName('e'),
};

export const simpleP2KeyMappings: KeyMappings = {
  movePaddleForward: KeyCode.fromKeyName('i'),
  movePaddleLeft: KeyCode.fromKeyName('j'),
  movePaddleBackward: KeyCode.fromKeyName('k'),
  movePaddleRight: KeyCode.fromKeyName('l'),
  rotatePaddleLeft: KeyCode.fromKeyName('u'),
  rotatePaddleRight: KeyCode.fromKeyName('o'),
};
