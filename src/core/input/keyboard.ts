export class KeyboardManager {

  private keyDownStates: { [keyCode: number]: boolean };

  public constructor() {
    this.keyDownStates = {};

    document.body.addEventListener("keydown", (e: KeyboardEvent) => {
      this.keyDownStates[e.keyCode] = true;
    });
    document.body.addEventListener("keyup", (e: KeyboardEvent) => {
      this.keyDownStates[e.keyCode] = false;
    });
  }

  public isKeyDown(keycode: number): boolean {
    return this.keyDownStates[keycode];
  }
}
