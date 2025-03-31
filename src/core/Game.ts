import { Application } from "pixi.js";
import { config } from "../config";
import { GameMap, Player } from "../entities";
import { InputHandler, DOMHandler } from "../services";

export class Game {
  private readonly app: Application;
  private gameMap!: GameMap;
  private player!: Player;
  private inputHandler!: InputHandler;
  private domHandler!: DOMHandler;

  constructor() {
    this.app = new Application();
  }

  public async start(containerId: string): Promise<void> {
    await this.initializeGraphics();
    this.mountToDom(containerId);
    this.initializeGameEntities();
    this.setupGameLoop();
    return Promise.resolve();
  }

  private async initializeGraphics(): Promise<void> {
    await this.app.init({
      background: config.backgroundColor,
      width: config.width,
      height: config.height,
      antialias: true,
    });
  }

  private mountToDom(containerId: string): void {
    this.domHandler = new DOMHandler();
    this.domHandler.attachCanvas(containerId, this.app.canvas);
  }

  private initializeGameEntities(): void {
    // создаем карту и точки
    this.gameMap = new GameMap(this.app);
    this.gameMap.createDots();
    this.app.stage.addChild(this.gameMap.getGraphics());

    // создаем игрока
    this.player = new Player(this.gameMap);
    this.player.setDots(this.gameMap.getDots());
    this.app.stage.addChild(this.player.getGraphics());

    // создаем обработчик ввода
    this.inputHandler = new InputHandler();
    this.setupControls();
  }

  private setupControls(): void {
    this.inputHandler.registerEventListeners(
      (key: string) => {
        if (this.player) {
          this.player.handleKeyDown(key);
        }
      },
      (key: string) => {
        if (this.player) {
          this.player.handleKeyUp(key);
        }
      }
    );
  }

  private setupGameLoop(): void {
    this.app.ticker.add(this.update.bind(this));
  }

  private update(): void {
    this.player.update(config.width);
  }

  public enableControls(): void {
    this.inputHandler.enable();
  }

  public disableControls(): void {
    this.inputHandler.disable();
  }

  // метод для создания и запуска игры
  public static async create(containerId: string): Promise<Game> {
    const game = new Game();
    await game.start(containerId);
    return game;
  }
}
