import { ClientEntitySynchronizer, ClientEntitySynchronizerContext } from "@akolos/ts-client-server-game-synchronization";
import { PongEntity } from "networking/entities/pong-entity";

export type PongClientEntitySynchronizerContext = ClientEntitySynchronizerContext<PongEntity>;
export type PongClientEntitySynchronizer = ClientEntitySynchronizer<PongEntity>;