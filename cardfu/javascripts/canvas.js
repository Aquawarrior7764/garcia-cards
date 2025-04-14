// This file manages the game's logic for most visual things and contains various functions
// for drawing on and manipulating the canvas, used by the game client.

//////////  Constructors  \\\\\\\\\\
function Label(position, text, size, visible, clickable, disabled, font, callback) {
	this.position = position;
	this.text = text;
	this.size = size;
	this.visible = visible;
	this.clickable = clickable;
	this.disabled = disabled;
	this.down = false;
	this.font = font;
	this.callback = callback;
}

//////////  Canvas  \\\\\\\\\\
function init() {
	canvas = document.getElementById("game-canvas");
	ctx = canvas.getContext("2d");
	handleResize();

	handSlots = [];
	for (var i = 1; i < 6; i++) {
		handSlots.push({
			position: { x: 0, y: 0 },
			card: undefined
		});
	}

	labels["logo"] = new Label({ x: 0.5, y: 0.3 }, "Card Fu", 192, true, false, false, "ChineseTakeaway");
	labels["play"] = new Label({ x: 0.5, y: 0.7 }, "Play!", 144, true, true, false, labelFont, enterQueue);
	labels["searching"] = new Label({ x: 0.5, y: 0.7 }, "Searching   ", 144, false, false, false, labelFont);
	labels["result"] = new Label({ x: 0.5, y: 0.3 }, "", 192, false, false, false, labelFont);
	labels["rematch"] = new Label({ x: 0.5, y: 0.62 }, "Rematch", 128, false, false, false, labelFont, requestRematch);
	labels["waiting"] = new Label({ x: 0.5, y: 0.62 }, "Waiting   ", 128, false, false, false, labelFont);
	labels["main menu"] = new Label({ x: 0.5, y: 0.78 }, "Main Menu", 128, false, false, false, labelFont, exitMatch);
	labels["timer"] = new Label({ x: 0.5, y: 0.1 }, 20, 64, false, false, false, labelFont);
}

function handleResize() {
	const pixelRatio = window.devicePixelRatio || 1;
	const aspectRatio = 16 / 10;

	const cssWidth = Math.min(window.innerWidth * 0.98, 600);
	const cssHeight = cssWidth / aspectRatio;

	canvas.style.width = cssWidth + "px";
	canvas.style.height = cssHeight + "px";

	canvas.width = cssWidth * pixelRatio;
	canvas.height = cssHeight * pixelRatio;

	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.scale(pixelRatio, pixelRatio);

	const logicalWidth = canvas.width / pixelRatio;
	const logicalHeight = canvas.height / pixelRatio;

	r = logicalWidth / 1000;
	cardWidth = 120 * r;
	cardHeight = cardWidth * 1.5;

	for (var i = 1; i < 6; i++) {
		if (handSlots[i - 1]) {
			handSlots[i - 1].position = {
				x: logicalWidth / 6 * i - cardWidth / 2,
				y: logicalHeight - cardHeight * 1.1
			};
		}
	}

	playerCardPosition = {
		x: logicalWidth * 0.17,
		y: logicalHeight * 0.15
	};
	opponentCardPosition = {
		x: logicalWidth * 0.83 - cardWidth * 1.5,
		y: logicalHeight * 0.15
	};
}

function animate() {
	requestAnimFrame(animate);
	draw();
}

//////////  Events  \\\\\\\\\\
// [keep the event functions unchanged for now — no edits needed here]

//////////  Drawing  \\\\\\\\\\
// [all drawCard / drawPoints / drawLabel functions remain unchanged]

//////////  Initialize  \\\\\\\\\\
window.requestAnimFrame = (function () {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();

var handSlots, canvas, ctx, cardWidth, cardHeight, playerCardPosition, opponentCardPosition;
var clickCursor = false,
	displayCardSlots = false,
	aspect = 16 / 10,
	labels = [],
	labelFont = "RagingRedLotusBB";
var typeColors = ["#FF8B26", "#1260E6", "#74D5F2"];
var types = ["Fire", "Water", "Ice"];
var colors = {
	"yellow": "#fdee00",
	"orange": "#ffb235",
	"green": "#52a546",
	"blue": "#246acd",
	"red": "#e02929",
	"purple": "#9738af"
};

init();
handleResize(); // force initial alignment
animate();

window.addEventListener("resize", handleResize, false);
canvas.addEventListener("mousemove", handleMouseMove, false);
canvas.addEventListener("mousedown", handleMouseDown, false);
canvas.addEventListener("mouseup", handleMouseUp, false);
setInterval(animateLabels, 300);