import { Graphics } from "pixi.js";
import { Direction, KeyMap } from "../types/types";
import { GameMap } from "./GameMap";
import { Dot } from "./Dot";
import { config } from "../config/config";

export class Player {
  private readonly graphics: Graphics;
  private readonly gameMap: GameMap;
  private currentDirection: Direction = { x: 0, y: 0 };
  private desiredDirection: Direction = { x: 0, y: 0 };
  private keys: KeyMap = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  };
  private score: number = 0;
  private dots: Dot[] = [];

  constructor(gameMap: GameMap) {
    this.gameMap = gameMap;
    this.graphics = new Graphics();
    this.createGraphics();
  }

  public getGraphics(): Graphics {
    return this.graphics;
  }

  public setDots(dots: Dot[]): void {
    this.dots = dots;
  }

  public handleKeyDown(key: string): void {
    if (key in this.keys) {
      this.keys[key] = true;
      if (key === "ArrowUp") {
        this.desiredDirection = { x: 0, y: -1 };
      } else if (key === "ArrowDown") {
        this.desiredDirection = { x: 0, y: 1 };
      } else if (key === "ArrowLeft") {
        this.desiredDirection = { x: -1, y: 0 };
      } else if (key === "ArrowRight") {
        this.desiredDirection = { x: 1, y: 0 };
      }
    }
  }

  public handleKeyUp(key: string): void {
    if (key in this.keys) {
      this.keys[key] = false;
    }
  }

  // метод для проверки коллизий с точками
  private checkDotCollisions(): void {
    const { x: playerX, y: playerY } = this.graphics;
    const collisionDistanceSq = (config.cellSize / 2) ** 2;

    for (const dot of this.dots) {
      if (dot.isCollected()) continue;

      const { x, y } = dot.getPosition();
      const distanceSq = (playerX - x) ** 2 + (playerY - y) ** 2;

      if (distanceSq < collisionDistanceSq) {
        dot.collect();
        this.score += config.dotPoints;
        console.log(`Score: ${this.score}`);
      }
    }
  }

  private createGraphics(): void {
    this.graphics.circle(0, 0, config.cellSize / 2).fill(config.playerColor);

    // начальная позиция
    this.graphics.position.set(
      14 * config.cellSize + config.cellSize / 2,
      23 * config.cellSize + config.cellSize / 2
    );
  }

  // обработка изменения направления
  private handleDirectionChange(centerX: number, centerY: number): void {
    // если нет желаемого направления, то выходим
    if (this.desiredDirection.x === 0 && this.desiredDirection.y === 0) {
      return;
    }

    // получаем информацию о текущей ячейке
    const cellX = Math.floor(centerX / config.cellSize);
    const cellY = Math.floor(centerY / config.cellSize);
    const cellCenterX = cellX * config.cellSize + config.cellSize / 2;
    const cellCenterY = cellY * config.cellSize + config.cellSize / 2;

    // расстояние до центра ячейки
    const distanceFromCenterX = Math.abs(centerX - cellCenterX);
    const distanceFromCenterY = Math.abs(centerY - cellCenterY);

    // порог для более отзывчивого управления
    const turnThreshold = config.playerSpeed * 4;

    // проверяем условия для смены направления
    const canChangeDirection =
      (this.desiredDirection.x !== 0 && distanceFromCenterY < turnThreshold) ||
      (this.desiredDirection.y !== 0 && distanceFromCenterX < turnThreshold);

    if (canChangeDirection) {
      // временно выравниваем позицию для точной проверки коллизий
      const originalX = this.graphics.x;
      const originalY = this.graphics.y;

      // выравниваем по оси, перпендикулярной желаемому направлению
      if (this.desiredDirection.x !== 0) {
        //если хотим двигаться горизонтально, выравниваем по Y
        this.graphics.y = cellCenterY;
      } else {
        // если хотим двигаться вертикально, выравниваем по X
        this.graphics.x = cellCenterX;
      }

      // проверяем следующую позицию с учетом выравнивания
      const nextX =
        this.graphics.x + this.desiredDirection.x * config.playerSpeed;
      const nextY =
        this.graphics.y + this.desiredDirection.y * config.playerSpeed;

      // проверяем возможность движения в новом направлении
      if (this.canMoveToPositionImproved(nextX, nextY, this.desiredDirection)) {
        // если можем повернуть, меняем направление
        this.currentDirection = { ...this.desiredDirection };
      } else {
        // если не можем двигаться в новом направлении, возвращаем исходную позицию
        this.graphics.x = originalX;
        this.graphics.y = originalY;
      }
    }
  }

  // проверка возможности движения для круглого хитбокса
  private canMoveToPositionImproved(
    x: number,
    y: number,
    direction: Direction
  ): boolean {
    // радиус персонажа
    const radius = config.cellSize / 2 - 1;

    // базовая проверка - центр персонажа
    if (!this.gameMap.canMove(x, y)) {
      return false;
    }

    // проверяем точки в зависимости от направления движения
    if (direction.x > 0) {
      // вправо
      return (
        this.gameMap.canMove(x + radius, y) && // передняя точка
        this.gameMap.canMove(x, y - radius * 0.7) && // верхняя точка (слегка ближе к центру)
        this.gameMap.canMove(x, y + radius * 0.7)
      ); // нижняя точка (слегка ближе к центру)
    }

    if (direction.x < 0) {
      // влево
      return (
        this.gameMap.canMove(x - radius, y) && // передняя точка
        this.gameMap.canMove(x, y - radius * 0.7) && // верхняя точка
        this.gameMap.canMove(x, y + radius * 0.7)
      ); // нижняя точка
    }

    if (direction.y > 0) {
      // вниз
      return (
        this.gameMap.canMove(x, y + radius) && // передняя точка
        this.gameMap.canMove(x - radius * 0.7, y) && // левая точка
        this.gameMap.canMove(x + radius * 0.7, y)
      ); // правая точка
    }

    if (direction.y < 0) {
      // вверх
      return (
        this.gameMap.canMove(x, y - radius) && // передняя точка
        this.gameMap.canMove(x - radius * 0.7, y) && // левая точка
        this.gameMap.canMove(x + radius * 0.7, y)
      ); // правая точка
    }

    // если нет направления, проверяем основные точки
    return (
      this.gameMap.canMove(x, y - radius) &&
      this.gameMap.canMove(x, y + radius) &&
      this.gameMap.canMove(x - radius, y) &&
      this.gameMap.canMove(x + radius, y)
    );
  }

  // обработка текущего движения
  private handleCurrentMovement(centerX: number, centerY: number): void {
    if (this.currentDirection.x === 0 && this.currentDirection.y === 0) {
      return;
    }

    // следующая позиция с учетом направления и скорости
    const nextX = centerX + this.currentDirection.x * config.playerSpeed;
    const nextY = centerY + this.currentDirection.y * config.playerSpeed;

    // используем улучшенный метод проверки коллизий
    if (this.canMoveToPositionImproved(nextX, nextY, this.currentDirection)) {
      // если можем двигаться, обновляем позицию
      this.graphics.x = nextX;
      this.graphics.y = nextY;
    } else {
      // определяем текущую и следующую ячейки
      const currentCellX = Math.floor(centerX / config.cellSize);
      const currentCellY = Math.floor(centerY / config.cellSize);

      const radius = config.cellSize / 2 - 1;

      // симметричная обработка столкновений для всех направлений
      if (this.currentDirection.x > 0) {
        // вправо
        // найдем ближайшую левую границу стены
        let wallX = (currentCellX + 1) * config.cellSize;
        while (
          this.gameMap.canMove(wallX, centerY) &&
          wallX < centerX + config.cellSize * 2
        ) {
          wallX += config.cellSize;
        }
        this.graphics.x = wallX - radius - 1;
      } else if (this.currentDirection.x < 0) {
        // влево
        // найдем ближайшую правую границу стены
        let wallX = currentCellX * config.cellSize;
        while (
          this.gameMap.canMove(wallX, centerY) &&
          wallX > centerX - config.cellSize * 2
        ) {
          wallX -= config.cellSize;
        }
        this.graphics.x = wallX + config.cellSize + radius + 1;
      } else if (this.currentDirection.y > 0) {
        // вниз
        // найдем ближайшую верхнюю границу стены
        let wallY = (currentCellY + 1) * config.cellSize;
        while (
          this.gameMap.canMove(centerX, wallY) &&
          wallY < centerY + config.cellSize * 2
        ) {
          wallY += config.cellSize;
        }
        this.graphics.y = wallY - radius - 1;
      } else if (this.currentDirection.y < 0) {
        // вверх
        // найдем ближайшую нижнюю границу стены
        let wallY = currentCellY * config.cellSize;
        while (
          this.gameMap.canMove(centerX, wallY) &&
          wallY > centerY - config.cellSize * 2
        ) {
          wallY -= config.cellSize;
        }
        this.graphics.y = wallY + config.cellSize + radius + 1;
      }
    }
  }

  // обработка перехода через туннель
  private handleTunnelTransition(screenWidth: number): void {
    if (this.graphics.x < 0) {
      this.graphics.x = screenWidth;
    } else if (this.graphics.x > screenWidth) {
      this.graphics.x = 0;
    }
  }

  public update(screenWidth: number): void {
    const centerX = this.graphics.x;
    const centerY = this.graphics.y;

    this.handleDirectionChange(centerX, centerY);
    this.handleCurrentMovement(centerX, centerY);
    this.handleTunnelTransition(screenWidth);
    this.checkDotCollisions();
  }
}
