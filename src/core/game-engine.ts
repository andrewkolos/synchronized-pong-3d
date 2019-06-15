import { GameLoop, TypedEventEmitter } from "@akolos/ts-client-server-game-synchronization";
import * as Three from "three";
import { Ball } from "./ball";
import { Pong3dConfig } from "./config/config";
import { Player } from "./enum/player";
import { Pong3dGameEngineEvents } from "./game-engine-events";
import { Paddle } from "./paddle";

interface Score {
  player1: number;
  player2: number;
}

export class Pong3dGameEngine {

  // Game Objects.
  public eastWall: Three.Mesh;
  public westWall: Three.Mesh;
  public player1Paddle: Paddle;
  public player2Paddle: Paddle;
  public ball: Ball;

  // Configuration.
  public config: Readonly<Pong3dConfig>;

  public eventEmitter: TypedEventEmitter<Pong3dGameEngineEvents> = new TypedEventEmitter();

  public get score(): Readonly<Score> {
    return this._score;
  }

  public get timeUntilServeSec(): number {
    return this._timeUntilServeSec;
  }

  private _score: Score;

  // Additional game state information.
  private _timeUntilServeSec: number;

  private ballIsInPlay: boolean;
  private server: Player;

  private gameLoop = new GameLoop(this.tick.bind(this));

  public constructor(config: Pong3dConfig) {
    const createWalls = () => {
      const playFieldWidth = config.playField.width;
      const playFieldHeight = config.playField.height;

      const wallWidth = config.walls.width;
      const WallDepth = config.walls.depth;

      const eastWallGeometry = new Three.BoxGeometry(wallWidth, playFieldHeight, WallDepth);
      const eastWall = new Three.Mesh(eastWallGeometry);
      eastWall.position.set(-playFieldWidth / 2 - (wallWidth / 2), 0, wallWidth);

      const westWallGeometry = new Three.BoxGeometry(wallWidth, playFieldHeight, WallDepth);
      const westWall = new Three.Mesh(westWallGeometry);
      westWall.position.set(playFieldWidth / 2 + (wallWidth / 2), 0, wallWidth);

      return { eastWall, westWall };
    };
    const createPaddles = () => {
      const createPaddle = (offset: number): Paddle => {
        const { width, height, depth } = config.paddles;
        const geometry = new Three.BoxGeometry(width, height, depth);
        const paddle = new Three.Mesh(geometry);

        paddle.position.set(0, offset, depth / 2);

        return {
          object: paddle,
          speed: new Three.Vector2(),
        };
      };

      const paddleHeight = config.paddles.height;
      const playFieldHeight = config.playField.height;
      const player1YPosOffset = - playFieldHeight / 2 + paddleHeight;
      const player2YPosOffset = - player1YPosOffset;

      return {
        player1Paddle: createPaddle(player1YPosOffset),
        player2Paddle: createPaddle(player2YPosOffset),
      };
    };
    const createBall = () => {
      const { radius, segmentCount } = config.ball;
      const geometry = new Three.SphereGeometry(radius, segmentCount, segmentCount);
      const innerBall = new Three.Mesh(geometry);
      // tslint:disable-next-line: no-shadowed-variable
      const ball = new Three.Group();
      ball.position.set(0, 0, radius);
      ball.add(innerBall);
      return new Ball(ball, innerBall, config.ball.initDx, config.ball.initDy);
    };

    const walls = createWalls();
    const paddles = createPaddles();
    const ball = createBall();

    this.eastWall = walls.eastWall;
    this.westWall = walls.westWall;
    this.player1Paddle = paddles.player1Paddle;
    this.player2Paddle = paddles.player2Paddle;
    this.ball = ball;

    // Initialize game state.
    this._timeUntilServeSec = 3;
    this.ballIsInPlay = false;
    this.server = Math.random() >= 0.5 ? Player.Player1 : Player.Player2;
    this._score = {
      player1: 0,
      player2: 0,
    };

    this.config = config;
  }

  public start() {
    this.gameLoop.start(this.config.game.tickRate);
  }

  public stop() {
    this.gameLoop.stop();
  }

  private tick() {
    this.moveBall();
    this.eventEmitter.emit("tick");
  }
  /**
   * Moves the ball.
   */
  private moveBall() {

    if (this.ballIsInPlay) {
      this.moveBallInPlay();
      if (this.config.aiPlayer != null && this.config.aiPlayer.enabled) {
        this.movePlayer2Paddle();
      }
    } else if (this.isBallBeingHeldByServer()) {
      this.moveBallPreparingToServe();
    } else if (this.isBallServingAtCurrentInstant()) {
      this.serveBall();
    }

    if (this._timeUntilServeSec > 0) {
      this._timeUntilServeSec -= 1 / this.config.game.tickRate;
    }

  }

  // tslint:disable-next-line: member-ordering
  private moveBallInPlay() {
    const ballObject = this.ball.object;

    const isCollidingWithWall = (): boolean => {
      const playFieldWith = this.config.playField.width;
      const ballRadius = this.config.ball.radius;

      return (ballObject.position.x < -(playFieldWith / 2) + ballRadius ||
        ballObject.position.x > playFieldWith / 2 - ballRadius);
    };

    const handleCollisionWithWall = () => {
      const ballIsAlreadyTravelingAwayFromWall = Math.sign(this.ball.dx) === Math.sign(this.ball.object.position.x);
      if (!ballIsAlreadyTravelingAwayFromWall) {
        this.ball.dx *= -1;
        this.eventEmitter.emit("ballHitWall");
      }
    };

    const isCollidingWithAnyPaddle = () => {
      const ball = this.ball.object;
      const ballRadius = this.config.ball.radius;
      const paddleWidth = this.config.paddles.width;
      const paddleHeight = this.config.paddles.height;

      const getRelativePosition = (object: Three.Object3D, relativeToObject: Three.Object3D) => {
        const relXPos = object.position.x - relativeToObject.position.x;
        const relYPos = object.position.y - relativeToObject.position.y;

        return new Three.Vector2(relXPos, relYPos);
      };

      const isCollidingWithPaddle = (paddle: Paddle) => {

        const origin = new Three.Vector2(0, 0);
        const ballRelPos = getRelativePosition(ball, paddle.object);
        const ballRelPosDisregardingRotation = ballRelPos.rotateAround(origin, -paddle.object.rotation.z);

        return (Math.abs(ballRelPosDisregardingRotation.x) - ballRadius < paddleWidth / 2 &&
          Math.abs(ballRelPosDisregardingRotation.y) - ballRadius < paddleHeight);

      };

      if (isCollidingWithPaddle(this.player1Paddle)) {
        return Player.Player1;
      } else if (isCollidingWithPaddle(this.player2Paddle)) {
        return Player.Player2;
      } else {
        return undefined;
      }
    };

    const isScoring = (): Player | undefined => {

      const ballYPosition = this.ball.object.position.y;
      const halfOfPlayFieldHeight = this.config.playField.height / 2;
      const ballDiameter = this.config.ball.radius * 2;
      if (ballYPosition > halfOfPlayFieldHeight + ballDiameter) {
        return Player.Player1;
      } else if (ballYPosition < -halfOfPlayFieldHeight - ballDiameter) {
        return Player.Player2;
      } else {
        return undefined;
      }

    };

    const correctionFactor = 60 / this.config.game.tickRate;
    const speedLimit = this.config.ball.speedLimit * correctionFactor;

    const velocity = new Three.Vector3(this.ball.dx, this.ball.dy, 0).multiplyScalar(correctionFactor);
    let distanceTraveled = velocity.length();
    if (distanceTraveled > speedLimit) {
      velocity.normalize().multiplyScalar(speedLimit);
      this.ball.dx = velocity.x;
      this.ball.dy = velocity.y;
      distanceTraveled = speedLimit;
    }

    ballObject.position.add(velocity);

    const angle = distanceTraveled / this.config.ball.radius;
    const axisOfRotation = new Three.Vector3(-this.ball.dy, this.ball.dy, 0).normalize();
    const rotation = new Three.Matrix4();
    rotation.makeRotationAxis(axisOfRotation, angle).multiplyScalar(correctionFactor);
    this.ball.innerObject.applyMatrix(rotation);

    const paddleBeingCollidedWith = isCollidingWithAnyPaddle();
    const scorer = isScoring();

    if (isCollidingWithWall()) {
      handleCollisionWithWall();
      this.eventEmitter.emit("ballHitWall");
    } else if (paddleBeingCollidedWith != null) {

      const aiEnabled = this.config.aiPlayer != null && this.config.aiPlayer.enabled;

      const delta = new Three.Vector2(this.ball.dx, this.ball.dy);
      const paddle = paddleBeingCollidedWith === Player.Player1 ? this.player1Paddle : this.player2Paddle;

      if (paddle === this.player1Paddle || !aiEnabled) {
        delta.x -= paddle.speed.x * this.config.ball.speedIncreaseOnPaddleHit;
        delta.y -= paddle.speed.y * this.config.ball.speedIncreaseOnPaddleHit;
        delta.rotateAround(new Three.Vector2(0, 0), -paddle.object.rotation.z);
      } else if (this.config.aiPlayer != null) {
        delta.y *= -1 * this.config.aiPlayer.speedIncreaseOnPaddleHit;
      }

      // TODO: May need to advance ball away from paddle to prevent a massive number of instantaneous collisions.

      this.eventEmitter.emit("ballHitPaddle");
    } else if (scorer != null) {

      const continuousRandom = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const initialYVelocityAfterServe = this.config.ball.initDy;

      this.ball.dy = scorer === Player.Player1 ? initialYVelocityAfterServe : -initialYVelocityAfterServe;
      this.ball.dx = continuousRandom(this.config.ball.minDx, this.config.ball.maxDx);

      this._timeUntilServeSec = this.config.pauseAfterScoreSec;
      if (scorer === Player.Player1) {
        this._score.player1 += 1;
      } else if (scorer === Player.Player2) {
        this._score.player2 += 1;
      }

      this.startServing();

      this.eventEmitter.emit("playerScored", scorer, this._score);
    }
  }

  private startServing() {
    this._timeUntilServeSec = this.config.pauseAfterScoreSec;
  }

  private movePlayer2Paddle() {
    if (this.config.aiPlayer == null) {
      throw Error("AI config is missing");
    }

    // tslint:disable-next-line: no-shadowed-variable
    const ball = this.ball.object;
    const player2PaddleObj = this.player2Paddle.object;
    const player2PaddleMinX = this.config.playField.width / 2 - this.config.paddles.width / 2;
    if (ball.position.x > player2PaddleObj.position.x && player2PaddleObj.position.x < player2PaddleMinX) {
      ball.position.x += this.config.aiPlayer.moveSpeed;
      if (ball.position.x < player2PaddleObj.position.x) {
        player2PaddleObj.position.x = ball.position.x;
      }
    } else if (ball.position.x > -player2PaddleMinX) {
      player2PaddleObj.position.x -= this.config.aiPlayer.moveSpeed;
      if (ball.position.x > player2PaddleObj.position.x) {
        player2PaddleObj.position.x = ball.position.x;
      }
    }
  }

  private moveBallPreparingToServe() {

    const ballObject = this.ball.object;

    const paddleHeight = this.config.paddles.height;
    const ballRadius = this.config.ball.radius;

    const servingPaddleObj = this.server === Player.Player1 ? this.player1Paddle.object : this.player2Paddle.object;
    const ballYPosOffsetPlayer1 = (paddleHeight / 2 + ballRadius * 2); // Move the ball in front of the paddle.
    const ballYPosOffsetPlayer2 = -ballYPosOffsetPlayer1;

    const ballYPosOffset = this.server === Player.Player1 ? ballYPosOffsetPlayer1 : ballYPosOffsetPlayer2;

    ballObject.position.x = servingPaddleObj.position.x + ballYPosOffset *
      Math.cos(servingPaddleObj.rotation.z + Math.PI / 2);
    ballObject.position.y = servingPaddleObj.position.y + ballYPosOffset *
      Math.sin(servingPaddleObj.rotation.z + Math.PI / 2);

  }

  private serveBall() {
    const initDy = this.config.ball.initDy;

    const servingPaddleObj = this.server === Player.Player1 ? this.player1Paddle.object : this.player2Paddle.object;
    this.ball.dx = initDy * Math.cos(servingPaddleObj.rotation.z - Math.PI / 2);
    this.ball.dy = initDy * Math.sin(servingPaddleObj.rotation.z - Math.PI / 2);

    this.ballIsInPlay = true;

    this.moveBall(); // Prevent ball from getting stuck on a moving paddle.
  }

  private isBallServingAtCurrentInstant() {
    return this._timeUntilServeSec <= 0;
  }

  private isBallBeingHeldByServer() {
    return this._timeUntilServeSec > 0;
  }

}
