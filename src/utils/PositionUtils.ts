import { config } from "../config";

export class PositionUtils {
  /**
   * преобразует индексы ячейки в координаты центра ячейки
   *
   * @param cellX x-индекс ячейки
   * @param cellY y-индекс ячейки
   * @returns объект с координатами центра ячейки
   */
  public static cellToPosition(
    cellX: number,
    cellY: number
  ): { x: number; y: number } {
    return {
      x: cellX * config.cellSize + config.cellSize / 2,
      y: cellY * config.cellSize + config.cellSize / 2,
    };
  }

  /**
   * преобразует координаты в индексы ячейки
   *
   * @param x x-координата
   * @param y y-координата
   * @returns объект с индексами ячейки
   */
  public static positionToCell(
    x: number,
    y: number
  ): { cellX: number; cellY: number } {
    return {
      cellX: Math.floor(x / config.cellSize),
      cellY: Math.floor(y / config.cellSize),
    };
  }

  /**
   * проверяет, находится ли позиция рядом с центром ячейки
   *
   * @param x x-координата
   * @param y y-координата
   * @param threshold пороговое значение расстояния
   * @returns true если позиция находится рядом с центром ячейки
   */
  public static isNearCellCenter(
    x: number,
    y: number,
    threshold: number = config.playerSpeed * 2
  ): boolean {
    const { cellX, cellY } = this.positionToCell(x, y);
    const center = this.cellToPosition(cellX, cellY);

    const distanceX = Math.abs(x - center.x);
    const distanceY = Math.abs(y - center.y);

    return distanceX <= threshold && distanceY <= threshold;
  }
}
