import { EntityStateBroadcastMessage, ServerEntitySynchronizer } from "@akolos/ts-client-server-game-synchronization";
import { Player } from "game-core/enum/player";
import { ClientId } from "../client-id";
import { PaddleEntity, PaddleInput, PaddleState } from "../entities/paddle";

interface PlayerMovementInfo {
  distanceCoveredInPast50Ms: number;
  lastInputSeenAt: Date;
}

export class PongServerEntitySynchronizer extends ServerEntitySynchronizer {

  private player1?: PaddleEntity;
  private player2?: PaddleEntity;

  private paddleMaxSpeedPerMs: number;

  private movementInfoByPlayer: Map<PaddleEntity, PlayerMovementInfo> = new Map();

  public constructor(paddleMaxSpeedPerMs: number) {
    super();
    this.paddleMaxSpeedPerMs = paddleMaxSpeedPerMs;
  }

  protected getIdForNewClient() {
    if (this.player1 == null) {
      return ClientId.P1;
    }
    if (this.player2 == null) {
      return ClientId.P2;
    }
    throw Error("Third client connected to server.");
  }

  protected handleClientConnection(newClientId: ClientId): void {
    const initialState: PaddleState = {
      x: 0,
      y: 0,
      zRot: 0,
    };

    const player = newClientId === ClientId.P1 ? Player.Player1 : Player.Player2;
    const playerEntity = new PaddleEntity(newClientId, initialState);

    const infoObj = {
      distanceCoveredInPast50Ms: 0,
      lastInputSeenAt: new Date(),
    };

    switch (newClientId) {
      case ClientId.P1:
      case ClientId.P2:
        this.movementInfoByPlayer.set(playerEntity, infoObj);
      case ClientId.P1:
        this.player1 = playerEntity;
        break;
      case ClientId.P2:
        this.player2 = playerEntity;
        break;
      default:
        throw Error(`Received unexpected client ID: ${newClientId}`);
    }

    this.entities.addEntity(playerEntity);
  }

  protected getStatesToBroadcastToClients(): EntityStateBroadcastMessage[] {
    const connectedPlayers = [];
    if (this.player1 != null) {
      connectedPlayers.push(this.player1);
    }
    if (this.player2 != null) {
      connectedPlayers.push(this.player2);
    }

    return connectedPlayers.map((player: PaddleEntity): EntityStateBroadcastMessage => {
      return {
        entityId: player.id,
        state: player.state,
      };
    });
  }

  protected validateInput(entity: PaddleEntity, input: PaddleInput): boolean {
    const movementInfo = this.movementInfoByPlayer.get(entity);
    if (movementInfo == null) {
      return false;
    }
    const distanceTraveled = Math.hypot(input.dx, input.dy);
    const timeSinceLastInput = new Date().getTime() - movementInfo.lastInputSeenAt.getTime();
    const availableMovementRatio = Math.min(timeSinceLastInput, 50) / 50;
    const movementAvailable = this.paddleMaxSpeedPerMs * 50 * availableMovementRatio;

    return distanceTraveled <= movementAvailable;
  }

}
