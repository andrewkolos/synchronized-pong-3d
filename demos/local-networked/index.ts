import { SimpleMessageRouter, InMemoryClientServerNetwork, PickSendType } from "@akolos/ts-client-server-game-synchronization";
import { BrowserClient } from "../../src/browser-client/browser-client";
import { basicConfig } from "../../src/game-core/config/basic-config";
import { Player } from "../../src/game-core/enum/player";
import { GameEngine } from "../../src/game-core/game-engine";
import { BrowserInputCollector, BrowserInputCollectorContext } from "../../src/game-core/input/collection/implementations/browser-input-collector";
import { ClientId } from "../../src/networking/client-id";
import { makeSimpleThreeRendererConfig } from "../../src/renderers/three/basic-renderer-config";
import { ThreeRenderer } from "../../src/renderers/three/renderer";
import { PongGameClientSideSynchronizer, GameClientServerConnectionInfo } from 'networking/client/game-client';
import { PaddleInputCollector } from 'game-core/input/collection/paddle-input-collector';
import { simpleP1KeyMappings, simpleP2KeyMappings } from 'game-core/input/collection/key-mappings';
import { PongGameServer, PongGameServerConfig } from 'networking/server/game-server';
import { ClientMessageTypeMap, ServerMessageTypeMap } from 'networking/client-server-communication/pong-send-to-client-type-map';

// player1RendererElement!.style.height = `${window.innerHeight}px`;

const SERVER_UPDATE_RATE = 60;
const SERVER_ENTITY_BROADCAST_RATE = 60;
const CLIENT_ENTITY_SYNC_RATE = 60;
const CLIENT_TICK_RATE = 240;
const CLIENT_GAME_SYNC_RATE = 15;
const SERVER_GAME_BROADCAST_RATE = 15;

const serverConfig: PongGameServerConfig = {
  entityBroadcastRateHz: SERVER_ENTITY_BROADCAST_RATE,
  gameConfig: basicConfig,
  gameBroadcastRateHz: SERVER_GAME_BROADCAST_RATE,
};

const server = new PongGameServer(serverConfig);

const network = (() => {
  type ClientSendType = PickSendType<ClientMessageTypeMap>;
  type ServerSendType = PickSendType<ServerMessageTypeMap>;
  return new InMemoryClientServerNetwork<ClientSendType, ServerSendType>();
})();

function createPongClient(game: GameEngine, player: Player): PongGameClientSideSynchronizer {

  function openClientConnectionOnServer(): ClientId {
    const connectionToClient = network.getNewClientConnection();
    const routerToClient = new SimpleMessageRouter<ServerMessageTypeMap>(connectionToClient);
    return server.connectClient(routerToClient);
  }

  const inputCollectorContext: BrowserInputCollectorContext = {
    game,
    keyMappings: player === Player.Player1 ? simpleP1KeyMappings : simpleP2KeyMappings,
    player,
    playerMoveSpeedPerMs: basicConfig.paddles.baseMoveSpeedPerMs,
  };

  const inputCollector: PaddleInputCollector = new BrowserInputCollector(inputCollectorContext);
  const context: GameClientServerConnectionInfo = {
    clientId: openClientConnectionOnServer(),
    entityUpdateRateHz: CLIENT_ENTITY_SYNC_RATE,
    router: new SimpleMessageRouter<ClientMessageTypeMap>(network.getNewConnectionToServer(0)),
    serverUpdateRateInHz: SERVER_ENTITY_BROADCAST_RATE,
  };

  return new PongGameClientSideSynchronizer(game, inputCollector, context);
}

function createBrowserClient(renderElementId: string, player: Player) {

  const renderElement = document.getElementById(renderElementId)!;

  const game = new GameEngine(basicConfig);
  const syncer = createPongClient(game, player);
  const browserClient = new BrowserClient(game, renderElement);

  return {
    game,
    renderElement,
    syncer,
    browserClient,
  };
}

const client1 = createBrowserClient("player1", Player.Player1);
const client2 = createBrowserClient("player2", Player.Player2);

client1.game.start();
client1.browserClient.start();
client2.game.start();
client2.browserClient.start();

server.start();

// RENDERING //

const topTwoRenderWidths = window.innerWidth * 0.5 - 15;
const topTwoRenderHeights = window.innerHeight * 0.5;
const bottomRenderWidth = window.innerWidth;
const bottomRenderHeight = window.innerHeight * 0.5;

const serverRenderer = new ThreeRenderer(makeSimpleThreeRendererConfig(bottomRenderWidth, bottomRenderHeight));
const domElement = serverRenderer.getRendererDomElement();
const serverRendererElement = document.getElementById("server")!;
serverRendererElement!.appendChild(domElement);

serverRenderer.startRendering(server.game);

window.addEventListener("resize", resizeRenderers);
window.addEventListener("load", resizeRenderers);

function resizeRenderers() {

  function adjustTopRenderer(client: {renderElement: HTMLElement, browserClient: BrowserClient}) {
    client.renderElement.style.height = `${topTwoRenderHeights}px`;
    client.renderElement.style.width = `${topTwoRenderWidths}px`;
    client.browserClient.setSize(topTwoRenderWidths, topTwoRenderHeights);
  }

  adjustTopRenderer(client1);
  adjustTopRenderer(client2);

  serverRendererElement!.style.height = `${bottomRenderHeight}px`;
  serverRendererElement!.style.width = `${bottomRenderWidth}px`;
  serverRenderer.setSize(bottomRenderWidth, bottomRenderHeight);
}
