import { Player } from "../enum/player";
import { PaddleInput } from "./paddle-input";

export interface PlayerBoundPaddleInput extends PaddleInput {
  player: Player;
}