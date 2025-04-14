// === CardFu Canvas Logic ===

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

function init() {
	canvas = document.getElementById("game-canvas");
	ctx = canvas.getContext("2d");

	labels["logo"] = new Label({ x: 0.5, y: 0.3 }, "Card Fu", 192, true, false, false, "ChineseTakeaway");
	labels["play"] = new Label({ x: 0.5, y: 0.7 }, "Play!", 144, true, true, false, labelFont, enterQueue);
	labels["searching"] = new Label({ x: 0.5, y: 0.7 }, "Searching   ", 144, false, false, false, labelFont);
	labels["result"] = new Label({ x: 0.5, y: 0.3 }, "", 192, false, false, false, labelFont);
	labels["rematch"] = new Label({ x: 0.5, y: 0.62 }, "Rematch", 128, false, false, false, labelFont, requestRematch);
	labels["waiting"] = new Label({ x: 0.5, y: 0.62 }, "Waiting   ", 128, false, false, false, labelFont);
	labels["main menu"] = new Label({ x: 0.5, y: 0.78 }, "Main Menu", 128, false, false, false, labelFont, exitMatch);
	labels["timer"] = new Label({ x: 0.5, y: 0.1 }, 20, 64, false, false, false, labelFont);

	handleResize();

	handSlots = [];
	for (let i = 1; i < 6; i++) {
		handSlots.push({
			position: {
				x: canvas.width / 6 * i - cardWidth / 2,
				y: canvas.height - cardHeight * 1.1
			},
			card: undefined
		});
	}
}

function handleResize() {
	let vw = window.innerWidth;
	let vh = window.innerHeight;

	if (vw < vh * aspect) {
		canvas.width = Math.max(300, vw * 0.95);
		canvas.height = canvas.width / aspect;
		r = canvas.width / 1000;
	} else {
		canvas.height = Math.max(300, vh * 0.6);
		canvas.width = canvas.height * aspect;
		r = canvas.height * aspect / 1000;
	}

	cardWidth = 120 * r;
	cardHeight = cardWidth * 1.5;

	if (handSlots) {
		for (let i = 1; i < 6; i++) {
			handSlots[i - 1].position = {
				x: canvas.width / 6 * i - cardWidth / 2,
				y: canvas.height - cardHeight * 1.1
			};
		}
	}

	playerCardPosition = { x: canvas.width * 0.17, y: canvas.height * 0.15 };
	opponentCardPosition = { x: canvas.width * 0.83 - cardWidth * 1.5, y: canvas.height * 0.15 };
}

function animate() {
	requestAnimFrame(animate);
	draw();
}

function handleMouseMove(event) {
	for (let i = 0; i < handSlots.length; i++) {
		if (isOnSlot(event, handSlots[i])) {
			if (!clickCursor) {
				canvas.style.cursor = "pointer";
				clickCursor = true;
			}
			return;
		}
	}
	for (let i in labels) {
		if (isOnLabel(event, labels[i])) {
			if (!clickCursor) {
				canvas.style.cursor = "pointer";
				clickCursor = true;
			}
			return;
		} else {
			labels[i].down = false;
		}
	}
	canvas.style.cursor = "auto";
	clickCursor = false;
}

function handleMouseDown(event) {
	for (let i in labels) {
		if (isOnLabel(event, labels[i]) && labels[i].clickable && !labels[i].disabled) {
			labels[i].down = true;
			return;
		}
	}
}

function handleMouseUp(event) {
	for (let i in labels) {
		if (labels[i].down) {
			labels[i].down = false;
			if (labels[i].callback && labels[i].clickable) {
				labels[i].callback();
			}
		}
	}
	for (let i = 0; i < handSlots.length; i++) {
		if (isOnSlot(event, handSlots[i])) {
			playCard(i);
			playerCard = handSlots[i].card;
			handSlots[i].card = undefined;
			return;
		}
	}
	handleMouseMove(event);
}

function isOnSlot(event, slot) {
	let x = event.pageX - canvas.offsetLeft;
	let y = event.pageY - canvas.offsetTop;
	return slot.card && canPlayCard &&
		x > slot.position.x && x < slot.position.x + cardWidth &&
		y > slot.position.y && y < slot.position.y + cardHeight;
}

function isOnLabel(event, label) {
	let x = event.pageX - canvas.offsetLeft;
	let y = event.pageY - canvas.offsetTop;
	if (label.clickable) {
		let labelWidth = label.text.length * label.size * r * 0.4;
		let labelHeight = label.size * r;
		let left = label.position.x * canvas.width - labelWidth / 2;
		let right = label.position.x * canvas.width + labelWidth / 2;
		let top = label.position.y * canvas.height - labelHeight / 2;
		let bottom = label.position.y * canvas.height + labelHeight / 2;
		return x > left && x < right && y > top && y < bottom;
	}
	return false;
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (displayCardSlots) {
		for (let i = 0; i < handSlots.length; i++) {
			if (handSlots[i].card) {
				drawCard(handSlots[i].card, handSlots[i].position, 1);
			} else {
				drawEmptySlot(handSlots[i]);
			}
		}
	}
	drawPoints();
	if (playerCard) drawCard(playerCard, playerCardPosition, 1.5);
	if (opponentCard) {
		opponentCard.isUnknown
			? drawUnknownCard(opponentCardPosition, 1.5)
			: drawCard(opponentCard, opponentCardPosition, 1.5);
	}
	for (let i in labels) {
		if (labels[i].visible) {
			drawLabel(labels[i]);
		}
	}
}

function drawCard(card, position, scale) {
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.fillStyle = colors[card.color];
	ctx.fillRect(position.x, position.y, cardWidth * scale, cardHeight * scale);
	ctx.strokeStyle = "#000";
	ctx.lineWidth = 2 * scale * r;
	ctx.strokeRect(position.x, position.y, cardWidth * scale, cardHeight * scale);
	ctx.fillStyle = "#fff";
	ctx.fillRect(position.x + cardWidth * scale * 0.1, position.y + cardHeight * scale * 0.067, cardWidth * scale * 0.8, cardHeight * scale * 0.866);
	ctx.fillStyle = typeColors[card.type];
	ctx.font = "bold " + (64 * scale * r) + "px chinese_takeaway";
	ctx.fillText(card.power, position.x + cardWidth * scale / 2, position.y + cardHeight * scale * 0.4);
	ctx.font = (32 * scale * r) + "px Arial";
	ctx.fillText(types[card.type], position.x + cardWidth * scale / 2, position.y + cardHeight * scale * 0.7);
}

function drawPointCard(card, position, scale) {
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.fillStyle = colors[card.color];
	ctx.fillRect(position.x, position.y, cardWidth * scale, cardWidth * scale);
	ctx.strokeStyle = "#000";
	ctx.lineWidth = 4 * scale * r;
	ctx.strokeRect(position.x, position.y, cardWidth * scale, cardWidth * scale);
	ctx.fillStyle = typeColors[card.type];
	ctx.font = "bold " + (72 * scale * r) + "px Arial";
	ctx.fillText(types[card.type][0], position.x + cardWidth * scale / 2, position.y + cardWidth * scale * 0.5);
	ctx.strokeStyle = "#fff";
	ctx.lineWidth = 3 * scale * r;
	ctx.strokeText(types[card.type][0], position.x + cardWidth * scale / 2, position.y + cardWidth * scale * 0.5);
}

function drawUnknownCard(position, scale) {
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.fillStyle = "#6f6f6f";
	ctx.fillRect(position.x, position.y, cardWidth * scale, cardHeight * scale);
	ctx.strokeStyle = "#000";
	ctx.lineWidth = 2 * scale * r;
	ctx.strokeRect(position.x, position.y, cardWidth * scale, cardHeight * scale);
	ctx.fillStyle = "#a0a0a0";
	ctx.fillRect(position.x + cardWidth * scale * 0.1, position.y + cardHeight * scale * 0.067, cardWidth * scale * 0.8, cardHeight * scale * 0.866);
	ctx.fillStyle = "#d1d1d1";
	ctx.font = "bold " + (72 * r * scale) + "px " + labelFont;
	ctx.fillText("?", position.x + cardWidth * scale / 2, position.y + cardHeight * 0.5 * scale);
}

function drawEmptySlot(slot) {
	ctx.fillStyle = "#a0a0a0";
	ctx.fillRect(slot.position.x, slot.position.y, cardWidth, cardHeight);
	ctx.strokeStyle = "#000";
	ctx.strokeRect(slot.position.x, slot.position.y, cardWidth, cardHeight);
}

function drawLabel(label) {
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.font = (label.size * r) + "px " + label.font;
	let shadow = label.size / 30;
	if (!label.disabled) {
		ctx.fillStyle = "#9a9a9a";
		ctx.fillText(label.text, canvas.width * label.position.x + shadow * r, canvas.height * label.position.y + shadow * r);
		ctx.fillStyle = "#000";
	} else {
		ctx.fillStyle = "#9a9a9a";
	}
	ctx.fillText(label.text, canvas.width * label.position.x, canvas.height * label.position.y);
}

// === Globals ===

var handSlots, canvas, ctx, cardWidth, cardHeight, playerCardPosition, opponentCardPosition;
var clickCursor = false,
	displayCardSlots = false,
	aspect = 16 / 10,
	labels = [],
	labelFont = "RagingRedLotusBB";
var typeColors = ["#FF8B26", "#1260E6", "#74D5F2"];
var types = ["Fire", "Water", "Ice"];
var colors = { yellow: "#fdee00", orange: "#ffb235", green: "#52a546", blue: "#246acd", red: "#e02929", purple: "#9738af" };

window.requestAnimFrame = (
	window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function (callback) {
		window.setTimeout(callback, 1000 / 60);
	}
);

// === Load AFTER DOM is Ready ===

document.addEventListener("DOMContentLoaded", () => {
	init();
	animate();
	window.addEventListener("resize", handleResize);
	canvas.addEventListener("mousemove", handleMouseMove);
	canvas.addEventListener("mousedown", handleMouseDown);
	canvas.addEventListener("mouseup", handleMouseUp);
	canvas.addEventListener("touchstart", handleMouseDown);
	canvas.addEventListener("touchend", handleMouseUp);
	canvas.addEventListener("touchmove", handleMouseMove);
	setInterval(animateLabels, 300);
});