import { SyncableEntity } from "@akolos/ts-client-server-game-synchronization";
import { GameEngine } from "../../game-core/game-engine";
import { Paddle } from "../../game-core/paddle";
import { BallEntity, BallState } from "../entities/ball";
import { PaddleEntity } from "../entities/paddle";
import { EntityId } from "../entity-ids";
import { PongClientEntitySynchronizer } from "./client-entity-synchronizer";
import { PongServerEntitySynchronizer } from "./server-entity-synchronizer";
import { Player } from "game-core/enum/player";
import { interpolateStatesLinearly } from 'misc/interpolateStatesLinearly';
import { Vector2, Vector3 } from 'three';
import { vec3FromVec2 } from 'renderers/three/misc/common';

type EntitySynchronizer = PongClientEntitySynchronizer | PongServerEntitySynchronizer;

const Observer = "Observer";

const BALL_PREDICTION_DISABLE_LENGTH_MS = 300;

export class GameObjectSynchronizer {

  public notPredictingLocalPlayerPaddleHit: boolean = true;

  private onPaddleHitCallback?: (player: Player) => void;
  private onSyncCallback?: () => void;

  public constructor(private gameToSync: GameEngine, private localPlayer: Player | typeof Observer,
    private entitySyncer: EntitySynchronizer) { }

  public start() {
    this.onSyncCallback = () => this.sync();
    this.onPaddleHitCallback = (player: Player) => this.handlePaddleHit(player);

    this.gameToSync.eventEmitter.on("ballHitPaddle", this.onPaddleHitCallback.bind(this));
    this.entitySyncer.eventEmitter.on("synchronized", this.onSyncCallback.bind(this));
  }

  public stop() {
    if (this.onSyncCallback != null) {
      this.entitySyncer.eventEmitter.off("synchronized", this.onSyncCallback);
      this.onSyncCallback = undefined;
    }
    if (this.onPaddleHitCallback != null) {
      this.gameToSync.eventEmitter.off("ballHitPaddle", this.onPaddleHitCallback);
      this.onPaddleHitCallback = undefined;
    }
  }

  private sync() {
    const gameToSync = this.gameToSync;

    this.entitySyncer.entities.asArray().forEach((value: SyncableEntity<unknown, unknown>) => {
      switch (value.id) {
        case EntityId.P1:
          const player1 = value as PaddleEntity;
          this.applySyncPaddleStateToGame(player1, gameToSync.player1Paddle);
          break;
        case EntityId.P2:
          const player2 = value as PaddleEntity;
          this.applySyncPaddleStateToGame(player2, gameToSync.player2Paddle);
          break;
        case EntityId.Ball:
          const gameBall = gameToSync.ball;
          const entityBall = value as BallEntity;
          const entityState = ballEntityStateToXYPair(entityBall.state);

          const angleBetweenGameVelocityAndEntityVelocity = 
            angleBetween(gameBall.velocity, new Vector2(entityState.velocity.x, entityState.velocity.y));
          const angleBetweenGameVelocityAndEntityVelocityIsNeglibible = angleBetweenGameVelocityAndEntityVelocity < 0.1;
          if (this.notPredictingLocalPlayerPaddleHit || !angleBetweenGameVelocityAndEntityVelocityIsNeglibible) {
            const differenceInBallLocs = distance(gameToSync.ball.position, entityBall.state);
            // Bend out large disparities in positions between the two all representations.
            if (differenceInBallLocs > 0.1 && differenceInBallLocs < 2 && gameBall.velocity.length() < differenceInBallLocs
              && angleBetweenGameVelocityAndEntityVelocityIsNeglibible) {
              const gameBallPosAndVel: PositionVelocityPair = { position: gameBall.position, velocity: gameBall.velocity }
              const newBallPosAndVel: PositionVelocityPair = interpolateStatesLinearly(gameBallPosAndVel, entityState, 1 / 16);
              Object.assign(gameBall.position, newBallPosAndVel.position);
              gameBall.velocity.normalize().multiplyScalar(new Vector2(entityState.velocity.x, entityState.velocity.y).length());
            } else {
              gameBall.position.x = entityBall.state.x;
              gameBall.position.y = entityBall.state.y;
              gameBall.velocity.x = entityBall.state.dx;
              gameBall.velocity.y = entityBall.state.dy;
            }
          }
          break;
      }
    });
  }

  private applySyncPaddleStateToGame(syncPaddle: PaddleEntity, gamePaddle: Paddle): void {
    gamePaddle.position.x = syncPaddle.state.x;
    gamePaddle.position.y = syncPaddle.state.y;
    gamePaddle.zRotationEulers = syncPaddle.state.zRot;
    gamePaddle.velocity.x = syncPaddle.state.velX;
    gamePaddle.velocity.y = syncPaddle.state.velY;
  }

  // tslint:disable-next-line: member-ordering
  private handlePaddleHit = (() => {
    let timeoutActive: boolean = false;

    return (player: Player) => {
      if (this.localPlayer === player) {
        if (!timeoutActive) {
          this.notPredictingLocalPlayerPaddleHit = false;

          setTimeout(() => {
            this.notPredictingLocalPlayerPaddleHit = true;
            timeoutActive = false;
          }, BALL_PREDICTION_DISABLE_LENGTH_MS);

          timeoutActive = true;
        }
      }
    }
  })();
}

interface XYPair {
  x: number;
  y: number;
}

interface PositionVelocityPair {
  position: XYPair;
  velocity: XYPair;
}

function ballEntityStateToXYPair(state: BallState): PositionVelocityPair {
  return {
    position: {
      x: state.x,
      y: state.y,
    },
    velocity: {
      x: state.dx,
      y: state.dy,
    },
  };
}

function distance(p1: XYPair, p2: XYPair) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function angleBetween(v1: Vector2, v2: Vector2) {
  return Math.abs(absVector(vec3FromVec2(v1)).angleTo(absVector(vec3FromVec2(v2))));
}

function absVector(v:Vector3): Vector3 {
  const abs = Math.abs;
  return new Vector3(abs(v.x), abs(v.y), abs(v.z));
}