import { GameLoop, TypedEventEmitter } from "@akolos/ts-client-server-game-synchronization";
import * as Three from "three";
import { Ball } from "./ball";
import { Config } from "./config/config";
import { Player } from "./enum/player";
import { GameEngineEvents } from "./game-engine-events";
import { Paddle } from "./paddle";
import { AiController } from "./paddle-ai";

interface Score {
  player1: number;
  player2: number;
}

export class GameEngine {

  // Exposed game state info.
  public player1Paddle: Paddle;
  public player2Paddle: Paddle;
  public ball: Ball;

  public get score(): Readonly<Score> {
    return this._score;
  }

  public get timeUntilServeSec(): number {
    return this._timeUntilServeSec;
  }

  /** Game configuration info. */
  public config: Readonly<Config>;

  public eventEmitter: TypedEventEmitter<GameEngineEvents> = new TypedEventEmitter();

  // Private game state info.
  private _score: Score;
  private _timeUntilServeSec: number;
  private ballIsInPlay: boolean;
  /** The player that is currently serving the ball (or who just served if the ball is still in play). */
  private server: Player;

  private gameLoop = new GameLoop(this.tick.bind(this));

  /**
   * Creates an instance of a pong game.
   * @param config The configuration describing properties of the game.
   */
  public constructor(config: Config) {
    const createPaddles = () => {
      const paddleWidth = config.paddles.width;
      const paddleHeight = config.paddles.height;
      const playFieldHeight = config.playField.height;
      const player1YPosOffset = - playFieldHeight / 2 + paddleHeight;
      const player2YPosOffset = - player1YPosOffset;

      return {
        player1Paddle: new Paddle(paddleWidth, paddleHeight, new Three.Vector2(0, player1YPosOffset)),
        player2Paddle: new Paddle(paddleWidth, paddleHeight, new Three.Vector2(0, player2YPosOffset)),
      };
    };

    const paddles = createPaddles();
    this.player1Paddle = paddles.player1Paddle;
    this.player2Paddle = paddles.player2Paddle;

    this.ball = new Ball(this, config.ball);
    this.ball.onPaddleBounce = () => this.eventEmitter.emit("ballHitPaddle");
    this.ball.onWallBounce = () => this.eventEmitter.emit("ballHitWall");

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

  /**
   * Starts the game.
   */
  public start() {
    this.gameLoop.start(this.config.game.tickRate);
  }

  /**
   * Stops the game. Game state is retained.
   */
  public stop() {
    this.gameLoop.stop();
  }

  private tick() {
    this.moveBall();
    if (this.config.aiPlayer != null && this.config.aiPlayer.enabled) {
      this.movePlayer2Paddle();
    }
    this.eventEmitter.emit("tick");
  }

  private moveBall() {

    if (this.ballIsInPlay) {
      const scorer = this.isBallScoring();
      if (scorer != null) {
        this.handleScore(scorer);
      } else {
        this.moveBallInPlay();
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

  private moveBallInPlay() {
    this.ball.advance();
  }

  private isBallScoring(): Player | undefined {
    const ballYPosition = this.ball.position.y;
    const halfOfPlayFieldHeight = this.config.playField.height / 2;
    const ballDiameter = this.config.ball.radius * 2;
    if (ballYPosition > halfOfPlayFieldHeight + ballDiameter) {
      return Player.Player1;
    } else if (ballYPosition < -halfOfPlayFieldHeight - ballDiameter) {
      return Player.Player2;
    } else {
      return undefined;
    }
  }

  private handleScore(scorer: Player) {
    this._timeUntilServeSec = this.config.pauseAfterScoreSec;
    if (scorer === Player.Player1) {
      this._score.player1 += 1;
    } else if (scorer === Player.Player2) {
      this._score.player2 += 1;
    }

    const server = scorer === Player.Player1 ? Player.Player2 : Player.Player1;
    this.startServing(server);

    this.eventEmitter.emit("playerScored", scorer, this._score);
  }

  private startServing(server: Player) {
    this.ballIsInPlay = false;
    this.ball.velocity.set(0, 0);
    this.server = server;
    this._timeUntilServeSec = this.config.pauseAfterScoreSec;
    this.eventEmitter.emit("startingServe");
  }

  private movePlayer2Paddle() {
    AiController.move(this, Player.Player2);
  }

  private moveBallPreparingToServe() {
    this.ball.teleportToPlayer(this.server);
  }

  private serveBall() {
    this.ball.sendTowardPlayer(this.server, this.config.ball.initialSpeedOnServe);
    this.ballIsInPlay = true;
    this.eventEmitter.emit("ballServed");
  }

  private isBallServingAtCurrentInstant() {
    return this._timeUntilServeSec <= 0;
  }

  private isBallBeingHeldByServer() {
    return this._timeUntilServeSec > 0;
  }

}
