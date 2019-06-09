import keycode from 'keycode';

export class KeyCode {
  private constructor(public readonly keyCode: number) { }

  public static fromKeyCode(keyCode: number) {
    return new KeyCode(keyCode);
  }

  public static fromKeyName(keyName: string) {
    return new KeyCode(keycode(keyName));
  }
}