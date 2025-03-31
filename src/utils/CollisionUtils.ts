import { GameMap } from "../entities/GameMap";
import { Direction } from "../types";
import { config } from "../config";

export class CollisionUtils {
  /**
   * проверяет, может ли объект двигаться в заданном направлении
   *
   * @param x текущая X-координата объекта
   * @param y текущая Y-координата объекта
   * @param direction направление движения
   * @param gameMap ссылка на карту игры
   * @param radius радиус объекта
   * @returns возможность движения
   */
  public static canMoveInDirection(
    x: number,
    y: number,
    direction: Direction,
    gameMap: GameMap,
    radius: number = config.cellSize / 2 - 1
  ): boolean {
    // базовая проверка - центр персонажа
    if (!gameMap.canMove(x, y)) {
      return false;
    }

    // проверяем точки в зависимости от направления движения
    if (direction.x > 0) {
      // движение вправо
      return (
        gameMap.canMove(x + radius, y) &&
        gameMap.canMove(x, y - radius * 0.7) &&
        gameMap.canMove(x, y + radius * 0.7)
      );
    }

    if (direction.x < 0) {
      // движение влево
      return (
        gameMap.canMove(x - radius, y) &&
        gameMap.canMove(x, y - radius * 0.7) &&
        gameMap.canMove(x, y + radius * 0.7)
      );
    }

    if (direction.y > 0) {
      // движение вниз
      return (
        gameMap.canMove(x, y + radius) &&
        gameMap.canMove(x - radius * 0.7, y) &&
        gameMap.canMove(x + radius * 0.7, y)
      );
    }

    if (direction.y < 0) {
      // движение вверх
      return (
        gameMap.canMove(x, y - radius) &&
        gameMap.canMove(x - radius * 0.7, y) &&
        gameMap.canMove(x + radius * 0.7, y)
      );
    }

    // если нет направления, проверяем основные точки
    return (
      gameMap.canMove(x, y - radius) &&
      gameMap.canMove(x, y + radius) &&
      gameMap.canMove(x - radius, y) &&
      gameMap.canMove(x + radius, y)
    );
  }

  /**
   * проверяет столкновение между двумя объектами
   *
   * @param x1 x-координата первого объекта
   * @param y1 y-координата первого объекта
   * @param x2 x-координата второго объекта
   * @param y2 y-координата второго объекта
   * @param distance минимальное расстояние для столкновения
   * @returns true если объекты сталкиваются
   */
  public static checkCollision(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    distance: number
  ): boolean {
    const distanceSq = (x1 - x2) ** 2 + (y1 - y2) ** 2;
    return distanceSq < distance ** 2;
  }
}
