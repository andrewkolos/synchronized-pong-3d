import { SimpleMessageRouter, InMemoryClientServerNetwork, PickSendType } from "@akolos/ts-client-server-game-synchronization";
import { BrowserClient } from "../../src/browser-client/browser-client";
import { basicConfig } from "../../src/game-core/config/basic-config";
import { Player, validatePlayerVal } from "../../src/game-core/enum/player";
import { GameEngine } from "../../src/game-core/game-engine";
import { BrowserInputCollector, BrowserInputCollectorContext } from "../../src/game-core/input/collection/implementations/browser-input-collector";
import { ClientId } from "../../src/networking/client-id";
import { makeSimpleThreeRendererConfig } from "../../src/renderers/three/basic-renderer-config";
import { ThreeRenderer } from "../../src/renderers/three/renderer";
import { PongGameClientSideSynchronizer, GameClientServerConnectionInfo } from "networking/client/client-side-synchronizer";
import { PaddleInputCollector } from "game-core/input/collection/paddle-input-collector";
import { simpleP1KeyMappings, simpleP2KeyMappings } from "game-core/input/collection/key-mappings";
import { PongGameServer, PongGameServerConfig } from "networking/server/game-server";
import { ClientMessageTypeMap, ServerMessageTypeMap } from "networking/client-server-communication/pong-send-to-client-type-map";
import { ClientMessageCategorizer, ServerMessageCategorizer } from "networking/client-server-communication/connections/message-categorizers";
import { Config } from 'game-core/config/config';

const SERVER_ENTITY_BROADCAST_RATE = 60;
const CLIENT_ENTITY_SYNC_RATE = 60;
const CLIENT_GAME_SYNC_RATE = 15;
const SERVER_GAME_BROADCAST_RATE = 15;

const CLIENT_LAG_MS = 35;

const serverGameConfig: Config = {} as any;
Object.assign(serverGameConfig, basicConfig);
serverGameConfig.ball.radius += 0.01;

const serverConfig: PongGameServerConfig = {
  entityBroadcastRateHz: SERVER_ENTITY_BROADCAST_RATE,
  gameConfig: serverGameConfig,
  gameBroadcastRateHz: SERVER_GAME_BROADCAST_RATE,
};

const server = new PongGameServer(serverConfig);

const network = (() => {
  type ClientSendType = PickSendType<ClientMessageTypeMap>;
  type ServerSendType = PickSendType<ServerMessageTypeMap>;
  return new InMemoryClientServerNetwork<ClientSendType, ServerSendType>();
})();

network.eventEmitter.on("serverSentMessageSent", (message: any) => {

});

network.eventEmitter.on("clientSentMessageSent", (message: any) => {

});

function createPongClient(game: GameEngine, player: Player): PongGameClientSideSynchronizer {
  validatePlayerVal(player);

  function openClientConnectionOnServer(): ClientId {
    const connectionToClient = network.getNewClientConnection();
    const routerToClient = new SimpleMessageRouter<ServerMessageTypeMap>(new ServerMessageCategorizer(), connectionToClient);
    return server.connectClient(routerToClient);
  }

  const inputCollectorContext: BrowserInputCollectorContext = {
    game,
    keyMappings: player === Player.Player1 ? simpleP1KeyMappings : simpleP2KeyMappings,
    player,
    playerMoveSpeedPerMs: basicConfig.paddles.baseMoveSpeedPerMs,
    playerRotateSpeedPerMs: basicConfig.paddles.baseRotateSpeedPerMs,
    disableGamepad: true,
  };

  const inputCollector: PaddleInputCollector = new BrowserInputCollector(inputCollectorContext);

  const serverInfo: GameClientServerConnectionInfo = {
    clientId: openClientConnectionOnServer(),
    entityUpdateRateHz: CLIENT_ENTITY_SYNC_RATE,
    router: new SimpleMessageRouter<ClientMessageTypeMap>(new ClientMessageCategorizer(), network.getNewConnectionToServer(CLIENT_LAG_MS)),
    serverUpdateRateInHz: SERVER_ENTITY_BROADCAST_RATE,
    gameMessageProcessingRate: CLIENT_GAME_SYNC_RATE,
  };

  return new PongGameClientSideSynchronizer(game, inputCollector, serverInfo);
}

interface CompleteClient {
  game: GameEngine;
  renderElement: HTMLElement;
  syncer: PongGameClientSideSynchronizer;
  browserClient: BrowserClient;
}
function createClient(renderElementId: string, player: Player): CompleteClient {

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

const client1 = createClient("player1", Player.Player1);
const client2 = createClient("player2", Player.Player2);

function startClient(client: CompleteClient) {
  client.game.start();
  client.browserClient.start();
  client.syncer.start();
}

startClient(client1);
startClient(client2);

server.start();

// RENDERING //

const topTwoRenderWidths = window.innerWidth * 0.5 - 15;
const topTwoRenderHeights = window.innerHeight * 0.5;
const bottomRenderWidth = window.innerWidth;
const bottomRenderHeight = window.innerHeight * 0.5;

const serverRenderer = new ThreeRenderer({...makeSimpleThreeRendererConfig(bottomRenderWidth, bottomRenderHeight), ...{clearColor: 0x000022}});
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
