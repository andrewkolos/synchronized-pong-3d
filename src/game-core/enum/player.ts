export enum Player {
  Player1,
  Player2,
}

export function validatePlayerVal(player: Player) {
  if (player !== Player.Player1 && player !== Player.Player2) {
    throw Error('Invalid Player value!');
  }
}
