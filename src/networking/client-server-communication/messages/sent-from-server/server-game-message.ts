import { PaddleServingMessage } from "./paddle-serving-message";
import { ScoreMessage } from "./score-message";

export type ServerGameMessage = PaddleServingMessage | ScoreMessage;
