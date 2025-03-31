import { Application, Graphics } from "pixi.js";
import { gameMap } from "../config/map";
import { Dot } from "./Dot";
import { config } from "../config/config";

export class GameMap {
  private readonly graphics: Graphics;
  private readonly dots: Dot[] = [];
  private readonly app: Application;

  constructor(app: Application) {
    this.app = app;
    this.graphics = new Graphics();
    this.draw();
  }

  public getGraphics(): Graphics {
    return this.graphics;
  }

  private draw(): void {
    for (let y = 0; y < gameMap.length; y++) {
      for (let x = 0; x < gameMap[y].length; x++) {
        if (gameMap[y][x] === 1) {
          // рисуем стену
          this.graphics
            .rect(
              x * config.cellSize,
              y * config.cellSize,
              config.cellSize,
              config.cellSize
            )
            .fill(config.wallColor);
        }
      }
    }
  }

  // метод для создания точек на карте
  public createDots(): void {
    for (let y = 0; y < gameMap.length; y++) {
      for (let x = 0; x < gameMap[y].length; x++) {
        if (gameMap[y][x] === 0) {
          // не создаем точки в начальной позиции игрока (14, 23)
          if (!(x === 14 && y === 23)) {
            const dot = new Dot(x, y);
            this.dots.push(dot);
            this.app.stage.addChild(dot.getGraphics());
          }
        }
      }
    }
  }

  // метод для получения всех точек
  public getDots(): Dot[] {
    return this.dots;
  }

  public canMove(x: number, y: number): boolean {
    // проверка для туннеля (строка 14)
    const tunnelRowY = 14 * config.cellSize + config.cellSize / 2;
    const tolerance = config.cellSize / 2;

    // если находимся в туннельной строке, разрешаем движение
    // за пределы карты по оси X
    if (Math.abs(y - tunnelRowY) <= tolerance) {
      // если вышли за пределы карты по X, но находимся в туннеле
      const cellX = Math.floor(x / config.cellSize);
      if (cellX < 0 || cellX >= gameMap[0].length) {
        return true;
      }
    }

    // преобразуем координаты в индексы ячеек карты
    const cellX = Math.floor(x / config.cellSize);
    const cellY = Math.floor(y / config.cellSize);

    // проверка выхода за границы карты
    if (
      cellX < 0 ||
      cellY < 0 ||
      cellY >= gameMap.length ||
      cellX >= gameMap[0].length
    ) {
      return false;
    }

    // проверка наличия стены (1 означает стену)
    const cell = gameMap[cellY][cellX];
    const isWall = cell === 1;
    return !isWall;
  }
}
