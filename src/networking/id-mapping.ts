import { EntityId } from './entity-ids';
import { Player, validatePlayerVal } from 'game-core/enum/player';
import { ValueOf } from 'misc/value-of';
import { ClientId } from './client-id';

export function getPlayerFromEntityId(entityId: EntityId[keyof EntityId]): Player {
  if (entityId === EntityId.P1) {
    return Player.Player1;
  } else if (entityId === EntityId.P2) {
    return Player.Player2;
  }

  throw Error(`Entity ID '${entityId}' does not correspond to a player entity.`);
}

export function getEntityIdFromPlayer(player: Player): EntityId {
  validatePlayerVal(player);

  return player === Player.Player1 ? EntityId.P1 : EntityId.P2;
}

export function getPlayerFromClientId(clientId: ValueOf<ClientId>): Player {
  if (clientId === ClientId.P1) {
    return Player.Player1;
  } else if (clientId === ClientId.P2) {
    return Player.Player2;
  } else {
    throw Error(`Client ID '${clientId}' is not a valid client ID.`);
  }
}
