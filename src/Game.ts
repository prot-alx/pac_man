import { Application } from "pixi.js";
import { GameMap } from "./entities/GameMap";
import { Player } from "./entities/Player";
import { config } from "./config/config";

export class Game {
  private readonly app: Application;
  private gameMap!: GameMap;
  private player!: Player;
  private controlsEnabled: boolean = true;

  constructor() {
    this.app = new Application();
  }

  public async start(containerId: string): Promise<void> {
    return this.initializeGame(containerId);
  }

  // отдельный метод для инициализации игры, вызываемый из start
  private async initializeGame(containerId: string): Promise<void> {
    await this.app.init({
      background: config.backgroundColor,
      width: config.width,
      height: config.height,
      antialias: true,
    });

    // добавляем canvas в DOM
    const container = document.getElementById(containerId);
    if (container) {
      container.appendChild(this.app.canvas);
    } else {
      console.error(`Элемент с ID "${containerId}" не найден!`);
      // создаем контейнер, если его нет
      const newContainer = document.createElement("div");
      newContainer.id = containerId;
      document.body.appendChild(newContainer);
      newContainer.appendChild(this.app.canvas);
    }

    // создаем карту и игрока
    this.gameMap = new GameMap(this.app);
    this.gameMap.createDots();
    this.app.stage.addChild(this.gameMap.getGraphics());

    this.player = new Player(this.gameMap);
    this.player.setDots(this.gameMap.getDots());
    this.app.stage.addChild(this.player.getGraphics());

    // настраиваем управление
    this.setupControls();

    // запускаем игровой цикл
    this.app.ticker.add(this.update.bind(this));
  }

  // метод для настройки управления
  private setupControls(): void {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  // обработчик нажатия клавиш
  private handleKeyDown(e: KeyboardEvent): void {
    if (this.controlsEnabled && this.player) {
      this.player.handleKeyDown(e.key);
    }
  }

  // обработчик отпускания клавиш
  private handleKeyUp(e: KeyboardEvent): void {
    if (this.controlsEnabled && this.player) {
      this.player.handleKeyUp(e.key);
    }
  }

  // Методы для включения и отключения управления
  public enableControls(): void {
    this.controlsEnabled = true;
  }

  public disableControls(): void {
    this.controlsEnabled = false;
  }

  private update(): void {
    this.player.update(config.width);
  }

  // метод для создания и запуска игры
  public static async create(containerId: string): Promise<Game> {
    const game = new Game();
    await game.start(containerId);
    return game;
  }
}
