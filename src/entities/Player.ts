import { Graphics } from "pixi.js";
import { config } from "../config";
import { Direction, KeyMap } from "../types";
import { CollisionUtils, PositionUtils } from "../utils";
import { Dot } from "./Dot";
import { GameMap } from "./GameMap";

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
      this.updateDesiredDirection(key);
    }
  }

  public handleKeyUp(key: string): void {
    if (key in this.keys) {
      this.keys[key] = false;
    }
  }

  // обновляет желаемое направление движения на основе нажатой клавиши
  private updateDesiredDirection(key: string): void {
    switch (key) {
      case "ArrowUp":
        this.desiredDirection = { x: 0, y: -1 };
        break;
      case "ArrowDown":
        this.desiredDirection = { x: 0, y: 1 };
        break;
      case "ArrowLeft":
        this.desiredDirection = { x: -1, y: 0 };
        break;
      case "ArrowRight":
        this.desiredDirection = { x: 1, y: 0 };
        break;
    }
  }

  // проверяет столкновения с точками
  private checkDotCollisions(): void {
    const { x: playerX, y: playerY } = this.graphics;
    const collisionDistance = config.cellSize / 2;

    for (const dot of this.dots) {
      if (dot.isCollected()) continue;

      const position = dot.getPosition();

      if (
        CollisionUtils.checkCollision(
          playerX,
          playerY,
          position.x,
          position.y,
          collisionDistance
        )
      ) {
        dot.collect();
        this.score += config.dotPoints;
        console.log(`Score: ${this.score}`);
      }
    }
  }

  // создает графическое представление игрока
  private createGraphics(): void {
    this.graphics.circle(0, 0, config.cellSize / 2).fill(config.playerColor);

    // начальная позиция
    const startPosition = PositionUtils.cellToPosition(14, 23);
    this.graphics.position.set(startPosition.x, startPosition.y);
  }

  // обрабатывает изменение направления движения
  private handleDirectionChange(): void {
    // если нет желаемого направления, выходим
    if (this.desiredDirection.x === 0 && this.desiredDirection.y === 0) {
      return;
    }

    const centerX = this.graphics.x;
    const centerY = this.graphics.y;
    const { cellX, cellY } = PositionUtils.positionToCell(centerX, centerY);
    const cellCenter = PositionUtils.cellToPosition(cellX, cellY);

    // расстояние до центра ячейки
    const distanceFromCenterX = Math.abs(centerX - cellCenter.x);
    const distanceFromCenterY = Math.abs(centerY - cellCenter.y);

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
        // если хотим двигаться горизонтально, выравниваем по Y
        this.graphics.y = cellCenter.y;
      } else {
        // если хотим двигаться вертикально, выравниваем по X
        this.graphics.x = cellCenter.x;
      }

      // проверяем следующую позицию с учетом выравнивания
      const nextX =
        this.graphics.x + this.desiredDirection.x * config.playerSpeed;
      const nextY =
        this.graphics.y + this.desiredDirection.y * config.playerSpeed;

      // проверяем возможность движения в новом направлении
      if (
        CollisionUtils.canMoveInDirection(
          nextX,
          nextY,
          this.desiredDirection,
          this.gameMap
        )
      ) {
        // если можем повернуть, меняем направление
        this.currentDirection = { ...this.desiredDirection };
      } else {
        // если не можем двигаться в новом направлении, возвращаем исходную позицию
        this.graphics.x = originalX;
        this.graphics.y = originalY;
      }
    }
  }

  // обрабатывает текущее движение игрока
  private handleCurrentMovement(): void {
    if (this.currentDirection.x === 0 && this.currentDirection.y === 0) {
      return;
    }

    const centerX = this.graphics.x;
    const centerY = this.graphics.y;

    // следующая позиция с учетом направления и скорости
    const nextX = centerX + this.currentDirection.x * config.playerSpeed;
    const nextY = centerY + this.currentDirection.y * config.playerSpeed;

    // используем улучшенный метод проверки коллизий
    if (
      CollisionUtils.canMoveInDirection(
        nextX,
        nextY,
        this.currentDirection,
        this.gameMap
      )
    ) {
      // если можем двигаться, обновляем позицию
      this.graphics.x = nextX;
      this.graphics.y = nextY;
    } else {
      this.alignPositionAfterCollision();
    }
  }

  // выравниваем позицию после столкновения со стеной
  private alignPositionAfterCollision(): void {
    const centerX = this.graphics.x;
    const centerY = this.graphics.y;
    const { cellX, cellY } = PositionUtils.positionToCell(centerX, centerY);
    const radius = config.cellSize / 2 - 1;

    // выравниваем позицию в зависимости от направления движения
    if (this.currentDirection.x > 0) {
      // движение вправо
      this.graphics.x = (cellX + 1) * config.cellSize - radius - 1;
    } else if (this.currentDirection.x < 0) {
      // движение влево
      this.graphics.x = cellX * config.cellSize + radius + 1;
    } else if (this.currentDirection.y > 0) {
      // движение вниз
      this.graphics.y = (cellY + 1) * config.cellSize - radius - 1;
    } else if (this.currentDirection.y < 0) {
      // движение вверх
      this.graphics.y = cellY * config.cellSize + radius + 1;
    }
  }

  // обрабатывает переход через туннель
  private handleTunnelTransition(screenWidth: number): void {
    if (this.graphics.x < 0) {
      this.graphics.x = screenWidth;
    } else if (this.graphics.x > screenWidth) {
      this.graphics.x = 0;
    }
  }

  // обновляет состояние игрока
  public update(screenWidth: number): void {
    this.handleDirectionChange();
    this.handleCurrentMovement();
    this.handleTunnelTransition(screenWidth);
    this.checkDotCollisions();
  }
}
