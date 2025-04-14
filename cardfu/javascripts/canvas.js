//////////  Canvas Setup & Initialization \\\\\\\\\\

function init() {
	canvas = document.getElementById("game-canvas");
	ctx = canvas.getContext("2d");
	handleResize();

	handSlots = [];
	for (let i = 1; i < 6; i++) {
		handSlots.push({
			position: { x: 0, y: 0 },
			card: undefined,
		});
	}

	labels["logo"] = new Label({ x: 0.5, y: 0.25 }, "Card Fu", 72, true, false, false, "ChineseTakeaway");
	labels["play"] = new Label({ x: 0.5, y: 0.5 }, "Play!", 48, true, true, false, labelFont, enterQueue);
	labels["searching"] = new Label({ x: 0.5, y: 0.5 }, "Searching   ", 48, false, false, false, labelFont);
	labels["result"] = new Label({ x: 0.5, y: 0.25 }, "", 72, false, false, false, labelFont);
	labels["rematch"] = new Label({ x: 0.5, y: 0.65 }, "Rematch", 40, false, false, false, labelFont, requestRematch);
	labels["waiting"] = new Label({ x: 0.5, y: 0.65 }, "Waiting   ", 40, false, false, false, labelFont);
	labels["main menu"] = new Label({ x: 0.5, y: 0.78 }, "Main Menu", 40, false, false, false, labelFont, exitMatch);
	labels["timer"] = new Label({ x: 0.5, y: 0.1 }, 20, 36, false, false, false, labelFont);
}

function handleResize() {
	const cssWidth = canvas.clientWidth;
	const cssHeight = canvas.clientHeight;
	const pixelRatio = window.devicePixelRatio || 1;

	canvas.width = cssWidth * pixelRatio;
	canvas.height = cssHeight * pixelRatio;

	ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset any transforms
	ctx.scale(pixelRatio, pixelRatio); // Scale to device resolution

	// Logical dimensions used for positioning
	const logicalWidth = canvas.width / pixelRatio;
	const logicalHeight = canvas.height / pixelRatio;

	r = logicalWidth / 1000;
	cardWidth = 120 * r;
	cardHeight = cardWidth * 1.5;

	// Update positions
	if (handSlots) {
		for (var i = 1; i < 6; i++) {
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

//////////  Event Fix: Use getBoundingClientRect \\\\\\\\\\

function getEventPosition(event) {
	const rect = canvas.getBoundingClientRect();
	const x = (event.clientX || event.touches?.[0]?.clientX) - rect.left;
	const y = (event.clientY || event.touches?.[0]?.clientY) - rect.top;
	return { x, y };
}

function isOnSlot(event, slot) {
	const { x, y } = getEventPosition(event);
	return slot.card &&
		canPlayCard &&
		x > slot.position.x &&
		x < slot.position.x + cardWidth &&
		y > slot.position.y &&
		y < slot.position.y + cardHeight;
}

function isOnLabel(event, label) {
	const { x, y } = getEventPosition(event);
	const labelWidth = label.text.length * label.size * r * 0.4;
	const labelHeight = label.size * r;
	const left = label.position.x * canvas.width - labelWidth / 2;
	const top = label.position.y * canvas.height - labelHeight / 2;

	return label.clickable &&
		x > left &&
		x < left + labelWidth &&
		y > top &&
		y < top + labelHeight;
}

//////////  Draw Loop \\\\\\\\\\

function animate() {
	requestAnimationFrame(animate);
	draw();
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (displayCardSlots) {
		for (let slot of handSlots) {
			slot.card ? drawCard(slot.card, slot.position, 1) : drawEmptySlot(slot);
		}
	}

	drawPoints();

	if (playerCard) drawCard(playerCard, playerCardPosition, 1.5);
	if (opponentCard)
		opponentCard.isUnknown
			? drawUnknownCard(opponentCardPosition, 1.5)
			: drawCard(opponentCard, opponentCardPosition, 1.5);

	for (let key in labels) {
		if (labels[key].visible) drawLabel(labels[key]);
	}
}

//////////  Initialization \\\\\\\\\\

window.addEventListener("resize", handleResize, false);
canvas.addEventListener("mousemove", handleMouseMove, false);
canvas.addEventListener("mousedown", handleMouseDown, false);
canvas.addEventListener("mouseup", handleMouseUp, false);

// Add mobile support
canvas.addEventListener("touchstart", handleMouseDown, false);
canvas.addEventListener("touchend", handleMouseUp, false);
canvas.addEventListener("touchmove", handleMouseMove, false);

init();
animate();