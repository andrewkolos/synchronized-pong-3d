import { MessageRouter } from "@akolos/ts-client-server-game-synchronization";
import { ServerMessageTypeMap } from "../pong-send-to-client-type-map";

export type PongRouterToClient = MessageRouter<ServerMessageTypeMap>;
