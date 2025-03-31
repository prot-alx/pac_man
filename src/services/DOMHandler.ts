export class DOMHandler {
  public attachCanvas(containerId: string, canvas: HTMLCanvasElement): void {
    let container = document.getElementById(containerId);

    if (!container) {
      console.info(`Создание контейнера с ID "${containerId}"`);
      container = this.createContainer(containerId);
    }

    container.appendChild(canvas);
  }

  private createContainer(containerId: string): HTMLElement {
    const container = document.createElement("div");
    container.id = containerId;
    document.body.appendChild(container);
    return container;
  }
}
