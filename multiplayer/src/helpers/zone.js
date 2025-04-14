export default class Zone {
  constructor(scene) {
    this.scene = scene;
  }

  renderZone(x = 400, y = 300) {
    const dropZone = this.scene.add.zone(x, y, 900, 250).setRectangleDropZone(900, 250);
    dropZone.setData({ cards: 0 });
    return dropZone;
  }

  renderOutline(dropZone) {
    const outline = this.scene.add.graphics();
    outline.lineStyle(4, 0xff69b4);
    outline.strokeRect(
      dropZone.x - dropZone.input.hitArea.width / 2,
      dropZone.y - dropZone.input.hitArea.height / 2,
      dropZone.input.hitArea.width,
      dropZone.input.hitArea.height
    );
  }
}