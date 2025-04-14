import Phaser from "phaser";
import Game from "./scenes/game"

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [GameScene]
};

const game = new Phaser.Game(config);

const game = new Phaser.Game(config);
