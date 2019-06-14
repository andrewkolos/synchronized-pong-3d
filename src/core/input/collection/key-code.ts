// tslint:disable-next-line: no-var-requires

export class KeyCode {

  public static fromKeyCode(keyCode: number) {
    return new KeyCode(keyCode);
  }

  public static fromKeyName(keyName: string) {
    const code = keycodes(keyName);
    if (code == null) {
      throw Error(`Could not convert ${keyName} to a keycode.`);
    }
    return new KeyCode(code);
  }

  private constructor(public readonly keyCode: number) { }
}

const keys: Map<string, number> = new Map([
  ["ctrl", 17],
  ["control", 17],
  ["alt", 18],
  ["option", 18],
  ["shift", 16],
  ["windows", 91],
  ["command", 91],
  ["esc", 27],
  ["escape", 27],
  ["`", 192],
  ["-", 189],
  ["=", 187],
  ["backspace", 8],
  ["tab", 9],
  ["\\", 220],
  ["[", 219],
  ["],", 221],
  [";", 186],
  ["'", 222],
  ["enter", 13],
  ["return", 13],
  [",", 188],
  [".", 190],
  ["/", 191],
  ["space", 32],
  ["pause", 19],
  ["break", 19],
  ["insert", 45],
  ["delete", 46],
  ["home", 36],
  ["end", 35],
  ["pageup", 33],
  ["pagedown", 34],
  ["left", 37],
  ["up", 38],
  ["right", 39],
  ["down", 40],
  ["capslock", 20],
  ["numlock", 144],
  ["scrolllock", 145],
]);

for (let f = 1; f < 20; f++) {
  keys.set('f' + f, 111 + f);
}

function keycodes(input: number): string;
function keycodes(input: string): number;
function keycodes(input: number | string) {
  if (typeof input === "string") {
    return getCode(input);
  }

  if (typeof input === "number") {
    return getKey(input);
  }
}

function getCode(input: string) {
  const c = keys.get(input.toLowerCase());
  if (c != null) {
    return c;
  }
  if (input.length === 1) {
    return input.toUpperCase().charCodeAt(0)
  }

  return undefined;
}

function getKey(input: number) {
  for (const k in keys) {
    if (keys.hasOwnProperty(k)) {
      if (keys.get(k) === input) {
        return k;
      }
    }
  }

  return String.fromCharCode(input).toLowerCase();
}
