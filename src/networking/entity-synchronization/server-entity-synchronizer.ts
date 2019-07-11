import { EntityStateBroadcastMessage, ServerEntitySynchronizer } from "@akolos/ts-client-server-game-synchronization";
import { ClientId } from "../client-id";
import { PaddleEntity, PaddleEntityInput, PaddleEntityState } from "../entities/paddle";
import { PongEntity } from "networking/entities/pong-entity";
import { BallEntity, BallState } from "networking/entities/ball";
import { EntityId } from "./entity-ids";
import { Player, validatePlayerVal } from "game-core/enum/player";

interface PlayerInfo {
  paddleEntity?: PaddleEntity;
  distanceCoveredInPast50Ms: number;
  lastInputSeenAt: Date;
}

interface InitialPaddleLocations {
  player1Y: number;
  player2Y: number;
}

export class PongServerEntitySynchronizer extends ServerEntitySynchronizer<PongEntity, ClientId> {

  public player1?: PaddleEntity;
  public player2?: PaddleEntity;
  public ballEntity: BallEntity;

  private paddleMaxSpeedPerMs: number;

  private movementInfoByPlayer: Map<PaddleEntity, PlayerInfo> = new Map();

  private readonly initialPaddleLocations: InitialPaddleLocations;

  public constructor(paddleMaxSpeedPerMs: number, initialPaddleLocations: InitialPaddleLocations) {
    super();
    this.paddleMaxSpeedPerMs = paddleMaxSpeedPerMs;
    this.initialPaddleLocations = initialPaddleLocations;

    this.ballEntity = new BallEntity(EntityId.Ball, {
      dx: 0,
      dy: 0,
      x: 0,
      y: 0,
    });
  }

  public setPaddleState(player: Player, state: PaddleEntityState) {
    validatePlayerVal(player);

    const paddle = player === Player.Player1 ? this.player1 : this.player2;

    if (paddle == null) {
      throw Error("Attempted to set state for paddle before player connected");
    }
    paddle.state = state;
  }

  public setBallState(state: BallState) {
    this.ballEntity.state = state;
  }

  protected getIdForNewClient(): ClientId {
    if (this.player1 == null) {
      return ClientId.P1;
    }
    if (this.player2 == null) {
      return ClientId.P2;
    }
    throw Error("Third client connected to server.");
  }

  protected handleClientConnection(newClientId: ClientId): void {

    const initialState: PaddleEntityState = {
      x: 0,
      y: newClientId === ClientId.P1 ? this.initialPaddleLocations.player1Y : this.initialPaddleLocations.player2Y,
      velX: 0,
      velY: 0,
      zRot: 0,
    };

    const playerEntity = new PaddleEntity(newClientId, initialState);

    const infoObj = {
      distanceCoveredInPast50Ms: 0,
      lastInputSeenAt: new Date(),
    };

    this.movementInfoByPlayer.set(playerEntity, infoObj);

    switch (newClientId) {
      case ClientId.P1:
        if (this.player1 != null) {
          throw Error("Client attempted to connect as P1 when P1 client has already been assigned an entity.");
        }
        this.player1 = playerEntity;
        break;
      case ClientId.P2:
        if (this.player2 != null) {
          throw Error("Client attempted to connect as P2 when P2 client has already been assigned an entity.");
        }
        this.player2 = playerEntity;
        break;
      default:
        throw Error(`Received unexpected client ID: ${newClientId}.`);
    }

    this.addPlayerEntity(playerEntity, newClientId);
  }

  protected getStatesToBroadcastToClients(): Array<EntityStateBroadcastMessage<PongEntity>> {
    const connectedPlayers = [];
    if (this.player1 != null) {
      connectedPlayers.push(this.player1);
    }
    if (this.player2 != null) {
      connectedPlayers.push(this.player2);
    }

    return connectedPlayers.map((player: PaddleEntity): EntityStateBroadcastMessage<PongEntity> => {
      return {
        entityId: player.id,
        state: player.state,
      };
    }).concat({
      entityId: EntityId.Ball,
      state: this.ballEntity.state,
    });
  }

  protected validateInput(entity: PaddleEntity, input: PaddleEntityInput): boolean {
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
