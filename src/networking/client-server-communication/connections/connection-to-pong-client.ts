import { SendableToClient } from "../pong-send-to-client-type-map";
import { ReceivableFromClient } from "../pong-send-to-server-type-map";
import { MessageBuffer } from "@akolos/ts-client-server-game-synchronization";

export type ConnectionToPongClient = MessageBuffer<ReceivableFromClient, SendableToClient>;
