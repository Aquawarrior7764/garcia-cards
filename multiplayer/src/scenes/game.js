import io from 'socket.io-client';
import Card from '../helpers/card';
import Dealer from "../helpers/dealer";
import Zone from '../helpers/zone';

export default class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    preload() {
        this.load.image('cyanCardFront', 'src/assets/CyanCardFront.png');
        this.load.image('cyanCardBack', 'src/assets/CyanCardBack.png');
        this.load.image('magentaCardFront', 'src/assets/MagentaCardFront.png');
        this.load.image('magentaCardBack', 'src/assets/MagentaCardBack.png');
    }

    create() {
        this.isPlayerA = false;
        this.opponentCards = [];
        
        // TEST: draw a white rectangle in the center of the screen
const debugRect = this.add.rectangle(
  this.scale.width / 2,
  this.scale.height / 2,
  100,
  100,
  0xffffff
);
debugRect.setOrigin(0.5);

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.zone = new Zone(this);
        this.dropZone = this.zone.renderZone(centerX, centerY); // UPDATE Zone.js to support coords
        this.outline = this.zone.renderOutline(this.dropZone);

        this.dealer = new Dealer(this);
        let self = this;

        this.socket = io();

        this.socket.on('connect', function () {
            console.log('Connected!');
        });

        this.socket.on('isPlayerA', function () {
            self.isPlayerA = true;
        });

        this.socket.on('dealCards', function () {
            self.dealer.dealCards();
            self.dealText.disableInteractive();
        });

        this.socket.on('cardPlayed', function (gameObject, isPlayerA) {
            if (isPlayerA !== self.isPlayerA) {
                let sprite = gameObject.textureKey;
                self.opponentCards.shift().destroy();
                self.dropZone.data.values.cards++;
                let card = new Card(self);
                card.render(centerX - 150 + (self.dropZone.data.values.cards * 50), centerY, sprite).disableInteractive();
            }
        });

        this.dealText = this.add.text(centerX, centerY + 200, 'DEAL CARDS', {
            fontSize: '18px',
            fontFamily: 'Trebuchet MS',
            color: '#00ffff'
        }).setOrigin(0.5).setInteractive();

        this.dealText.on('pointerdown', function () {
            self.socket.emit("dealCards");
        });

        this.dealText.on('pointerover', function () {
            self.dealText.setColor('#ff69b4');
        });

        this.dealText.on('pointerout', function () {
            self.dealText.setColor('#00ffff');
        });

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragstart', function (pointer, gameObject) {
            gameObject.setTint(0xff69b4);
            self.children.bringToTop(gameObject);
        });

        this.input.on('dragend', function (pointer, gameObject, dropped) {
            gameObject.setTint();
            if (!dropped) {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        });

        this.input.on('drop', function (pointer, gameObject, dropZone) {
            dropZone.data.values.cards++;
            gameObject.x = centerX - 150 + (dropZone.data.values.cards * 50);
            gameObject.y = centerY;
            gameObject.disableInteractive();
            self.socket.emit('cardPlayed', gameObject, self.isPlayerA);
        });
    }

    update() {}
}