import { ClientEntitySynchronizer, InMemoryClientServerNetwork } from "@akolos/ts-client-server-game-synchronization";
import { BrowserClient } from "../../src/browser-client/browser-client";
import { basicConfig, basicConfigWithAiOpponent } from "../../src/game-core/config/basic-config";
import { Player } from "../../src/game-core/enum/player";
import { GameEngine } from "../../src/game-core/game-engine";
import { AiPaddleInputCollector } from "../../src/game-core/input/collection/ai-paddle-input-collector";
import { BrowserInputCollector } from "../../src/game-core/input/collection/implementations/browser-input-collector";
import { simpleKeyMappings } from "../../src/game-core/input/collection/simple-key-mappings";
import { ClientId } from "../../src/networking/client-id";
import { PongInputCollectionStrategy } from "../../src/networking/client/pong-input-collection-strategy";
import { PongEntityFactory } from "../../src/networking/entity-synchronization/entity-factory";
import { GameObjectSynchronizer } from "../../src/networking/entity-synchronization/game-object-synchronizer";
import { PongServerEntitySynchronizer } from "../../src/networking/entity-synchronization/server-entity-synchronizer";
import { makeSimpleThreeRendererConfig } from "../../src/renderers/three/basic-renderer-config";
import { ThreeRenderer } from "../../src/renderers/three/renderer";

// player1RendererElement!.style.height = `${window.innerHeight}px`;

const network = new InMemoryClientServerNetwork();

const serverSyncer = new PongServerEntitySynchronizer(basicConfig.paddles.baseMoveSpeedPerMs);

const player1RendererElement = document.getElementById("player1");
const client1 = new BrowserClient(player1RendererElement!, { gameConfig: basicConfig });
const client1Id = serverSyncer.connect(network.getNewClientConnection());
const player1ClientGame = ((game: GameEngine) => {
  const connectionToServer = network.getNewServerConnection(0);
  const inputCollector = new PongInputCollectionStrategy(client1Id, new BrowserInputCollector({
    game,
    keyMappings: simpleKeyMappings,
    player: client1Id === ClientId.P1 ? Player.Player1 : Player.Player2,
    playerMoveSpeedPerMs: basicConfig.paddles.baseMoveSpeedPerMs,
  }));

  return new ClientEntitySynchronizer({
    serverConnection: connectionToServer,
    entityFactory: new PongEntityFactory(),
    inputCollector,
    serverUpdateRateInHz: 60,
  });
})(client1.game);

const player2RendererElement = document.getElementById("player2");
const client2Id = serverSyncer.connect(network.getNewClientConnection());
const client2 = new BrowserClient(player2RendererElement!, { gameConfig: basicConfig });
const player2ClientGame = ((game: GameEngine) => {
  const connectionToServer = network.getNewServerConnection(0);
  const player = client2Id === ClientId.P1 ? Player.Player1 : Player.Player2;
  const inputCollector = new AiPaddleInputCollector(game, player, basicConfigWithAiOpponent.aiPlayer.moveSpeed);

  return new ClientEntitySynchronizer({
    serverConnection: connectionToServer,
    entityFactory: new PongEntityFactory(),
    inputCollector: new PongInputCollectionStrategy(client2Id, inputCollector),
    serverUpdateRateInHz: 60,
  });
})(client2.game);

client1.startGame();
client2.startGame();

const serverRendererElement = document.getElementById("server");
const serverGame = new GameEngine(basicConfig);
serverGame.start();
serverSyncer.startServer(60);

new GameObjectSynchronizer(client1.game, player1ClientGame).start();
new GameObjectSynchronizer(client2.game, player2ClientGame).start();
new GameObjectSynchronizer(serverGame, serverSyncer).start();

// Rendering stuff.

const bottomRenderWidth = window.innerWidth;
const bottomRenderHeight = window.innerHeight * 0.5;

const serverRenderer = new ThreeRenderer(makeSimpleThreeRendererConfig(bottomRenderWidth, bottomRenderHeight));
const domElement = serverRenderer.getRendererDomElement();
serverRendererElement!.appendChild(domElement);
serverRenderer.startRendering(serverGame);

window.addEventListener("resize", resizeRenderers);
window.addEventListener("load", resizeRenderers);

function resizeRenderers() {
  const topTwoRenderWidths = window.innerWidth * 0.5;
  const topTwoRenderHeights = window.innerHeight * 0.5;
  const bottomRenderWidth = window.innerWidth;
  const bottomRenderHeight = window.innerHeight * 0.5;

  player1RendererElement!.style.height = `${topTwoRenderHeights}px`;
  player1RendererElement!.style.width = `${topTwoRenderWidths}px`;
  client1.setSize(topTwoRenderWidths, topTwoRenderHeights);

  player2RendererElement!.style.height = `${topTwoRenderHeights}px`;
  player2RendererElement!.style.width = `${topTwoRenderWidths}px`;
  client2.setSize(topTwoRenderWidths, topTwoRenderHeights);

  serverRendererElement!.style.height = `${bottomRenderHeight}px`;
  serverRendererElement!.style.width = `${bottomRenderWidth}px`;
  serverRenderer.setSize(bottomRenderWidth, bottomRenderHeight);
}
