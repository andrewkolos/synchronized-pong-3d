import { KeyCode } from "./key-code";
import { KeyMappings } from "./key-mappings";

export const simpleKeyMappings: KeyMappings = {
  movePaddleForward: KeyCode.fromKeyName("w"),
  movePaddleLeft: KeyCode.fromKeyName("a"),
  movePaddleBackward: KeyCode.fromKeyName("s"),
  movePaddleRight: KeyCode.fromKeyName("d"),
  rotatePaddleLeft: KeyCode.fromKeyName("q"),
  rotatePaddleRight: KeyCode.fromKeyName("e"),
};
