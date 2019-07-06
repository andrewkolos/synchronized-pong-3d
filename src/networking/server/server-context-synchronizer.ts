import { IntervalRunner } from "misc/interval-runner";
import { GameEngine } from "game-core/game-engine";

export class ServerContextSynchronizer {

  private readonly intervalRunner: IntervalRunner;
  private readonly game: GameEngine;

  public constructor(game: GameEngine, connection: Connection<ClientGameMessage, ServerGameMessage>, syncRateHz: number) {
    this.game = game;
    this.intervalRunner = new IntervalRunner(() => this.sync(), syncRateHz);
  }

  public start() {
    this.intervalRunner.start();
  }

  public stop() {
    this.intervalRunner.stop();
  }

  private sync() {
    const messages = 
  }
}
