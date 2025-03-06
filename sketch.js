let buttons = [];
let randomTexts = [];
let isChasing = true; // Tracks whether the text is chasing the cursor
let isExploding = false; // Tracks whether the text is exploding
const chaseRadius = 100; // Radius within which the text will explode on click
const chaseSpeed = 20; // Increased speed at which the text chases the cursor
const explosionSpeed = 5; // Speed at which the text explodes away
const returnSpeed = 2; // Speed at which the text returns to chasing
let clickCount = 0; // Tracks the number of clicks
let explosionRadius = 200; // Radius of the circle around the cursor

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  // Create 3 buttons
  const buttonData = [
    { text: "Button 1", overlayId: "overlay-1", closeId: "close-overlay-1", color: "#FF5733" }, // Orange
    { text: "Button 2", overlayId: "overlay-2", closeId: "close-overlay-2", color: "#33FF57" }, // Green
    { text: "Button 3", overlayId: "overlay-3", closeId: "close-overlay-3", color: "#3357FF" }, // Blue
  ];

  for (let i = 0; i < buttonData.length; i++) {
    let btn = createButton(buttonData[i].text);
    btn.addClass("myButton");

    // Random position for each button
    let x = random(width - 150);
    let y = random(height - 40);
    btn.position(x, y);

    // Assign a specific color to the button
    btn.style("background-color", buttonData[i].color);

    // Link each button to its overlay
    btn.mousePressed(() => showOverlay(buttonData[i].overlayId));

    // Add close button functionality
    let closeBtn = select(`#${buttonData[i].closeId}`);
    if (closeBtn) {
      closeBtn.mousePressed(() => hideOverlay(buttonData[i].overlayId));
    } else {
      console.error(`Close button for ${buttonData[i].overlayId} not found!`);
    }

    buttons.push({ element: btn, x: x, y: y, xSpeed: random(-2, 2), ySpeed: random(-2, 2) });
  }

  // Create random text spam
  for (let i = 0; i < 10; i++) {
    let txt = createDiv("CLICK ME!!!");
    txt.class("randomText");
    txt.position(random(width), random(height));
    randomTexts.push(txt);
  }

  // Initialize click counter
  updateClickCounter();
}

function draw() {
  background(0); // Clear the background every frame

  // Move buttons randomly
  for (let btn of buttons) {
    // Update button position
    btn.x += btn.xSpeed;
    btn.y += btn.ySpeed;

    // Bounce off the edges of the canvas
    if (btn.x < 0 || btn.x > width - 150) {
      btn.xSpeed *= -1;
    }
    if (btn.y < 0 || btn.y > height - 40) {
      btn.ySpeed *= -1;
    }

    // Update button position on the screen
    btn.element.position(btn.x, btn.y);
  }

  if (isChasing && !isExploding) {
    // Make the text aggressively chase the cursor
    for (let txt of randomTexts) {
      let txtX = parseFloat(txt.style("left")); // Get current X position
      let txtY = parseFloat(txt.style("top")); // Get current Y position

      // Move the text towards the cursor very quickly
      if (txtX < mouseX) txtX += chaseSpeed;
      if (txtX > mouseX) txtX -= chaseSpeed;
      if (txtY < mouseY) txtY += chaseSpeed;
      if (txtY > mouseY) txtY -= chaseSpeed;

      // Update the text position
      txt.position(txtX, txtY);
    }
  } else if (isExploding) {
    // Explode the text in a circular pattern around the cursor
    for (let i = 0; i < randomTexts.length; i++) {
      let txt = randomTexts[i];
      let txtX = parseFloat(txt.style("left")); // Get current X position
      let txtY = parseFloat(txt.style("top")); // Get current Y position

      // Calculate the angle for this text element
      let angle = (TWO_PI / randomTexts.length) * i; // Evenly distribute around the circle
      let targetX = mouseX + cos(angle) * explosionRadius; // Target X position
      let targetY = mouseY + sin(angle) * explosionRadius; // Target Y position

      // Move the text towards its target position
      txtX = lerp(txtX, targetX, 0.1); // Smoothly interpolate towards the target
      txtY = lerp(txtY, targetY, 0.1);

      // Update the text position
      txt.position(txtX, txtY);
    }

    // Check if the text is close enough to its target position
    let allTextInPlace = true;
    for (let txt of randomTexts) {
      let txtX = parseFloat(txt.style("left")); // Get current X position
      let txtY = parseFloat(txt.style("top")); // Get current Y position

      // Calculate distance between text and its target position
      let angle = (TWO_PI / randomTexts.length) * randomTexts.indexOf(txt);
      let targetX = mouseX + cos(angle) * explosionRadius;
      let targetY = mouseY + sin(angle) * explosionRadius;
      let distance = dist(txtX, txtY, targetX, targetY);

      // If any text is still far from its target, keep exploding
      if (distance > 10) {
        allTextInPlace = false;
        break;
      }
    }

    // If all text is in place, stop exploding and resume chasing
    if (allTextInPlace) {
      isExploding = false;
    }
  } else {
    // Gradually bring the text back to chasing the cursor
    for (let txt of randomTexts) {
      let txtX = parseFloat(txt.style("left")); // Get current X position
      let txtY = parseFloat(txt.style("top")); // Get current Y position

      // Move the text towards the cursor slowly
      if (txtX < mouseX) txtX += returnSpeed;
      if (txtX > mouseX) txtX -= returnSpeed;
      if (txtY < mouseY) txtY += returnSpeed;
      if (txtY > mouseY) txtY -= returnSpeed;

      // Update the text position
      txt.position(txtX, txtY);
    }

    // Check if the text is close enough to resume chasing
    let allTextClose = true;
    for (let txt of randomTexts) {
      let txtX = parseFloat(txt.style("left")); // Get current X position
      let txtY = parseFloat(txt.style("top")); // Get current Y position

      // Calculate distance between cursor and text
      let distance = dist(mouseX, mouseY, txtX, txtY);

      // If any text is still far away, keep returning
      if (distance > chaseRadius) {
        allTextClose = false;
        break;
      }
    }

    // If all text is close, resume chasing
    if (allTextClose) {
      isChasing = true;
    }
  }
}

function mousePressed() {
  // Increment click counter
  clickCount++;
  updateClickCounter();

  // Check if any text is within the chase radius
  let shouldExplode = false;
  for (let txt of randomTexts) {
    let txtX = parseFloat(txt.style("left")); // Get current X position
    let txtY = parseFloat(txt.style("top")); // Get current Y position

    // Calculate distance between cursor and text
    let distance = dist(mouseX, mouseY, txtX, txtY);

    // If the text is within the radius, mark for explosion
    if (distance < chaseRadius) {
      shouldExplode = true;
      break; // Exit the loop once explosion is triggered
    }
  }

  // If any text is within the radius, explode all text
  if (shouldExplode) {
    isChasing = false;
    isExploding = true;
  }
}

// Update the click counter display
function updateClickCounter() {
  let clickCountElement = select("#click-count");
  if (clickCountElement) {
    clickCountElement.html(clickCount);
  }
}

function showOverlay(overlayId) {
  let overlay = select(`#${overlayId}`);
  if (overlay) {
    overlay.removeClass("hidden");
  } else {
    console.error(`Overlay ${overlayId} not found!`);
  }
}

function hideOverlay(overlayId) {
  let overlay = select(`#${overlayId}`);
  if (overlay) {
    overlay.addClass("hidden");
  } else {
    console.error(`Overlay ${overlayId} not found!`);
  }
}

// Ensure the DOM is fully loaded before running setup
window.onload = function () {
  setup();
};