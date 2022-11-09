import { InheritableEventEmitter } from '@akolos/event-emitter';

export type TickHandler = () => void;

export interface GameLoopEvents {
  preStep: () => void;
  postStep: () => void;
}

/**
 * Executes (game) logic at a constant rate using safe fixed time steps across
 * any hardware.
 */
export class GameLoop extends InheritableEventEmitter<GameLoopEvents> {
  private tickIntervalId?: NodeJS.Timer;
  private readonly tickHandler: TickHandler;

  public constructor(tickHandler: TickHandler) {
    super();
    this.tickHandler = tickHandler;
  }

  /**
   * Starts the game.
   * @param stepRateHz How often the game should advance its state.
   */
  public start(stepRateHz: number) {
    this.stop();
    this.tickIntervalId = setInterval(() => this.tick(), (1 / stepRateHz) * 1000);
  }

  /**
   * Game state stops advancing. State is unaffected.
   */
  public stop(): void {
    if (this.tickIntervalId != null) {
      clearInterval(this.tickIntervalId);
      this.tickIntervalId = undefined;
    }
  }

  /**
   * Determines whether the game is running.
   * @returns true if the game is running.
   */
  public isRunning() {
    return this.tickIntervalId !== undefined;
  }

  private tick() {
    this.emit('preStep');
    this.tickHandler();
    this.emit('postStep');
  }
}
