import { GameLoop } from '@akolos/ts-client-server-game-synchronization';
import Three from 'three';
import { DeepReadonly } from './util';

class PongBall {
  public object: Three.Group;
  public innerObject: Three.Mesh;
  public dx: number;
  public dy: number;
  public collidingWithPaddle: boolean;
  public collidingWithWall: boolean;

  public constructor(object: Three.Group, innerObject: Three.Mesh, initDx: number, initDy: number) {
    this.object = object;
    this.innerObject = innerObject;
    this.dx = initDx;
    this.dy = initDy;

    this.collidingWithPaddle = false;
    this.collidingWithWall = false;
  }
}

enum Player {
  Player1,
  Player2
}

export class Pong3dGameEngine {

  public eastWall: Three.Mesh;
  public westWall: Three.Mesh;
  public player1Paddle: Three.Mesh;
  public player2Paddle: Three.Mesh;
  public ball: PongBall;

  public config: Readonly<Pong3dConfig>;

  private timeUntilServeSec: number;
  private ballIsInPlay: boolean;

  private server: Player;

  private gameLoop = new GameLoop(this.tick.bind(this));

  public constructor(config: Pong3dConfig) {
    const createWalls = () => {
      const width = config.walls.width;
      const depth = config.walls.depth;
      const playFieldHeight = config.playField.height;

      const eastWallGeometry = new Three.BoxGeometry(width, playFieldHeight, depth);
      const eastWall = new Three.Mesh(eastWallGeometry);
      
      const westWallGeometry = new Three.BoxGeometry(width, playFieldHeight, depth);
      const westWall = new Three.Mesh(westWallGeometry);

      return { eastWall, westWall };
    };
    const createPaddles = () => {
      const createPaddle = (offset: number) => {
        const { width, height, depth } = config.paddles;
        const geometry = new Three.BoxGeometry(width, height, depth);
        const paddle = new Three.Mesh(geometry);

        paddle.position.set(0, offset, depth / 2);
        
        return paddle;
      }

      const paddleHeight = config.paddles.height;
      const playFieldHeight = config.playField.height;
      const player1YPosOffset = playFieldHeight / 2 + paddleHeight / 2;
      const player2YPosOffset = - player1YPosOffset;

      return {
        player1Paddle: createPaddle(player1YPosOffset),
        player2Paddle: createPaddle(player2YPosOffset)
      }
    };
    const createBall = () => {
      const { radius, segmentCount } = config.ball;
      const geometry = new Three.SphereGeometry(radius, segmentCount, segmentCount);
      const innerBall = new Three.Mesh(geometry);
      const ball = new Three.Group();
      ball.position.set(0,0, radius);
      ball.add(innerBall);
      return new PongBall(ball, innerBall, config.ball.initDx, config.ball.initDy);
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
    this.timeUntilServeSec = 3;
    this.ballIsInPlay = false;
    this.server = Math.random() >= 0.5 ? Player.Player1 : Player.Player2;

    this.config = config;
  }

  public start() {
    this.gameLoop.start(this.config.game.tickRate);
  }

  public stop() {
    this.gameLoop.stop();
  }

  private tick() {
    this.moveBall(this.config.game.tickRate);
  };

  /**
   * Moves the ball.
   * @param movesPerSecond Approximately how many times per second this function is being called.
   *  This function was originally written to be called at 60Hz, so this allows the logic to be
   *  corrected to move the ball at the same speed regardless of the game update rate.
   */
  private moveBall(movesPerSecond: number) {
    const correctionFactor = 60 / movesPerSecond;

    const ballObject = this.ball.object;
    const speedLimit = this.config.ball.speedLimit * correctionFactor;

    if (this.ballIsInPlay) {
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
    }
    else if (this.isBallBeingHeldByServer) {
      const paddleHeight = this.config.paddles.height;
      const ballRadius = this.config.ball.radius;

      const servingPaddle = this.server === Player.Player1 ? this.player1Paddle : this.player2Paddle;
      const ballYPosOffsetPlayer1 = (paddleHeight / 2 + ballRadius * 2); // Move the ball in front of the paddle.
      const ballYPosOffsetPlayer2 = -ballYPosOffsetPlayer1;

      const ballYPosOffset = this.server == Player.Player1 ? ballYPosOffsetPlayer1 : ballYPosOffsetPlayer2;

      ballObject.position.x = servingPaddle.position.x + ballYPosOffset *
        Math.cos(servingPaddle.rotation.z + Math.PI / 2);
      ballObject.position.y = servingPaddle.position.y + ballYPosOffset *
        Math.sin(this.player1Paddle.rotation.z + Math.PI / 2);
    } else if (this.isBallServingAtCurrentInstant) {
      const initDy = this.config.ball.initDy;

      const servingPaddle = this.server === Player.Player1 ? this.player1Paddle : this.player2Paddle;
      this.ball.dx = initDy * Math.cos(servingPaddle.rotation.z - Math.PI / 2);
      this.ball.dy = initDy * Math.sin(servingPaddle.rotation.z - Math.PI / 2);

      this.moveBall(movesPerSecond); // Prevent ball from getting stuck on a moving paddle.
    }
  }

  private isBallServingAtCurrentInstant() {
    return this.timeUntilServeSec <= 0;
  }

  private isBallBeingHeldByServer() {
    return this.timeUntilServeSec > 0;
  }

}

interface Pong3dConfig {
  game: {
    tickRate: number;
  }
  playField: {
    width: number;
    height: number;
    centerlineWidth: number;
  },
  walls: {
    width: number;
    depth: number;
  }
  paddles: {
    width: number;
    height: number;
    depth: number;
    baseMoveSpeed: number;
    computerMoveSpeed: number;
  },
  ball: {
    radius: number;
    segmentCount: number;
    iFrames: number;
    speedLimit: number;
    speedIncreaseOnPaddleHit: number;
    maxDx: number;
    minDx: number;
    initDx: number;
    initDy: number;
  },
  pauseAfterScoreSec: number;
}

interface Pong3dThreeRendererConfig {
  window: {
    width: number;
    height: number;
  }
  camera: {
    viewAngle: number;
    aspectRatio: number;
    nearClippingPlane: number;
    farClippingPlane: number;
    position: {
      x: number;
      y: number;
      z: number;
    }
  }
  playField: {
    color: number;
    centerlineWidth: number;
  }
  wallColor: number;
  paddles: {
    player1Color: number;
    player2Color: number;
  }
  scoreboard: {
    width: number;
    height: number;
    depth: number;
    position: {
      x: number;
      y: number;
      z: number;
    }
    color: number;
  }
  ballSpeedMeter: {
    width: number;
    height: number;
    position: {
      x: number;
      y: number;
      z: number;
    }
    color: number;
    speedMeterPartColors: number[];
    windupMeterPartColors: number[];
    separatorSize: number;
    minSpeed: number;
    maxSpeed: number;
  },
  screenShake: {
    minSpeed: number;
    maxSpeed: number;
    maximums: {
      x: number;
      y: number;
      z: number;
    }
  },
  brightness: {
    directional: number;
    scoreboard: number;
    hemi: number;
    ambient: number;
  }
}