export interface BallConfig {
  /** The radius of the ball. */
  radius: number;
  /** The maximum speed the ball is allowed to travel in 1/60 of a second. */
  speedLimit: number;
  /** How much the speed of the ball should increase upon coming in contact with a paddle,
   *  given as a ratio of the paddle's velocity (between 0 and 1).
   */
  speedIncreaseOnPaddleHitRatio: number;

  /** How much the speed of the ball should increase upon coming in contact with a paddle
   * in addition to the speed imparted by the paddle's velocity.
   */
  baseSpeedIncreaseOnPaddleHit: number;
  /** The speed given to the ball when it is served. */
  initialSpeedOnServe: number;
}

export interface Config {
  game: {
    /** How often, in Hz, the game updates its state. */
    tickRate: number;
  };
  playField: {
    /** The width of the play field. */
    width: number;
    /** The height of the play field. */
    height: number;
    /** The size of the neutral/center zone, which neither player paddle
     * is allowed to move into.
     */
    neutralZoneHeight: number;
  };
  paddles: {
    /** The width of both paddles. */
    width: number;
    /** The height of both paddles. */
    height: number;
    /** The depth of both paddles. */
    depth: number;
    baseMoveSpeedPerMs: number;
    baseRotateSpeedPerMs: number;
  };
  ball: BallConfig;
  /** How many seconds until the ball is served after a player scores. */
  pauseAfterScoreSec: number;
  aiPlayer?: {
    enabled: boolean;
    moveSpeed: number;
  };
}
