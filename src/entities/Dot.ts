import { Graphics } from "pixi.js";
import { config } from "../config/config";

export class Dot {
  private readonly graphics: Graphics;
  private readonly x: number;
  private readonly y: number;
  private collected: boolean = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.graphics = new Graphics();
    this.createGraphics();
  }

  private createGraphics(): void {
    this.graphics.circle(0, 0, config.dotSize).fill(config.dotColor);

    // позиция центра точки (центр ячейки)
    this.graphics.position.set(
      this.x * config.cellSize + config.cellSize / 2,
      this.y * config.cellSize + config.cellSize / 2
    );
  }

  public getGraphics(): Graphics {
    return this.graphics;
  }

  public isCollected(): boolean {
    return this.collected;
  }

  public collect(): void {
    this.collected = true;
    this.graphics.visible = false;
  }

  // получение позиции для проверки коллизий
  public getPosition(): { x: number; y: number } {
    return {
      x: this.x * config.cellSize + config.cellSize / 2,
      y: this.y * config.cellSize + config.cellSize / 2,
    };
  }
}
