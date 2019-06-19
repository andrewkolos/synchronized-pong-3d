declare module "responsive-gamepad" {
  export namespace ResponsiveGamepad {
    const Keyboard: Keyboard;
    const Gamepad: Gamepad;
    const TouchInput: TouchInput;
    function getVersion(): string;
    function enable(): void;
    function disable(): void;
    function isEnabled(): boolean;
    function addPlugin(plugin: unknown): () => void;
    function getState(): ResponsiveGamepadState | {};
    function onInputsChange(arrayOfResponsiveGamepadInputs: unknown[], callback: () => void): () => void;
    function clearInputMap(): void;
  }

  export interface Keyboard {
    enableIgnoreWhenInputElementFocused(): void;
    disableIgnoreWhenInputElementFocused(): void;
    enableIgnoreWhenModifierState(): void;
    disableIgnoreWhenModifierState(): void;
    setKeysToResponsiveGamepadInput(ArrayOfKeyboardEventCodes: unknown, ResponsiveGamepadInput: unknown): void;
  }

  export interface Gamepad {
    getState(PlayerIndex: number): GamepadState;
    setGamepadButtonsToResponsiveGamepadInput(ArrayOfGamepadButtonIds: unknown, NonAxisResponsiveGamepadInput: unknown): void;
    setGamepadAxisToResponsiveGamepadInput(GamepadAxisIds: unknown, AxisResponsiveGamepadInput: unknown): void;
  }

  export interface GamepadState {
    
  }

  export interface TouchInput {
    addButtonInput(HTMLElement: HTMLElement, ResponsiveGamepadInput: unknown): void;
    addDpadInput(HTMLElement: HTMLElement, configurationObject: unknown): void
    addLeftAnalogInput(HTMLElement: HTMLElement): void;
    addRightAnalogInput(HTMLElement: HTMLElement): void;
  }

  export interface ResponsiveGamepadState {
    "DPAD_UP": boolean,
    "DPAD_RIGHT": false,
    "DPAD_DOWN": boolean,
    "DPAD_LEFT": boolean,
    "LEFT_ANALOG_HORIZONTAL_AXIS": number,
    "LEFT_ANALOG_VERTICAL_AXIS": number,
    "LEFT_ANALOG_UP": boolean,
    "LEFT_ANALOG_RIGHT": boolean,
    "LEFT_ANALOG_DOWN": boolean,
    "LEFT_ANALOG_LEFT": boolean,
    "LEFT_ANALOG_PRESS": boolean,
    "RIGHT_ANALOG_HORIZONTAL_AXIS": number,
    "RIGHT_ANALOG_VERTICAL_AXIS": number,
    "RIGHT_ANALOG_UP": boolean,
    "RIGHT_ANALOG_RIGHT": boolean,
    "RIGHT_ANALOG_DOWN": boolean,
    "RIGHT_ANALOG_LEFT": boolean,
    "RIGHT_ANALOG_PRESS": boolean,
    "A": boolean,
    "B": boolean,
    "X": boolean,
    "Y": boolean,
    "LEFT_TRIGGER": boolean,
    "LEFT_BUMPER": boolean,
    "RIGHT_TRIGGER": boolean,
    "RIGHT_BUMPER": boolean,
    "SELECT": boolean,
    "START": boolean,
    "SPECIAL": boolean,
    "UP": boolean,
    "RIGHT": boolean,
    "DOWN": boolean,
    "LEFT": boolean,
    "EXAMPLE_PLUGIN_ADDED": true
  }
}