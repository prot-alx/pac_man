export class InputHandler {
  private enabled: boolean = true;
  private keyDownHandler: ((key: string) => void) | null = null;
  private keyUpHandler: ((key: string) => void) | null = null;
  private boundKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private boundKeyUp: ((e: KeyboardEvent) => void) | null = null;

  public registerEventListeners(
    onKeyDown: (key: string) => void,
    onKeyUp: (key: string) => void
  ): void {
    // сохраняем обработчики
    this.keyDownHandler = onKeyDown;
    this.keyUpHandler = onKeyUp;

    // создаем привязанные функции обработчиков
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);

    // регистрируем обработчики
    window.addEventListener("keydown", this.boundKeyDown);
    window.addEventListener("keyup", this.boundKeyUp);
  }

  public removeEventListeners(): void {
    if (this.boundKeyDown) {
      window.removeEventListener("keydown", this.boundKeyDown);
    }

    if (this.boundKeyUp) {
      window.removeEventListener("keyup", this.boundKeyUp);
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.enabled && this.keyDownHandler) {
      this.keyDownHandler(e.key);
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (this.enabled && this.keyUpHandler) {
      this.keyUpHandler(e.key);
    }
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }
}
