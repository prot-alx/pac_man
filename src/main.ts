import { Game } from "./Game";

Game.create("game-container").catch((error) => {
  console.error("Ошибка инициализации игры:", error);
});
