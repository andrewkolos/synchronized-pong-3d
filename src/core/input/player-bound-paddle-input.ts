import { PaddleInput } from './paddle-input';
import { Player } from '../enum/player';

export interface PlayerBoundPaddleInput extends PaddleInput {
  player: Player;
}