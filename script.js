// Define cases data
const cases = {
  "Final nail in the coffin": [
    { name: "Nail", weight: 70, image: "images/nail.jpg" },
    { name: "Hammer", weight: 25, image: "images/hammer.jpg" },
    { name: "Coffin", weight: 5, image: "images/coffin.jpg" },
  ],
  "10% Cotton": [
    { name: "Cotton Ball", weight: 40, image: "images/cotton_ball.jpg" },
    { name: "Cotton Gloves", weight: 35, image: "images/cotton_gloves.jpg" },
    { name: "Cotton T-Shirt", weight: 25, image: "images/cotton_tshirt.jpg" },
  ],
  "Lucky Mutant": [
    { name: "Mutant Eye", weight: 50, image: "images/mutant_eye.jpg" },
    { name: "Mutant Claw", weight: 30, image: "images/mutant_claw.jpg" },
    { name: "Mutant Heart", weight: 20, image: "images/mutant_heart.jpg" },
  ]
};

// Choose which case to open here:
const currentCaseName = "Final nail in the coffin";
const items = cases[currentCaseName];

// Update the title in HTML
document.getElementById('caseTitle').textContent = currentCaseName;

// Weighted random item selection
function getRandomItem() {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    if (random < item.weight) return item;
    random -= item.weight;
  }
}

// Create an array of items to scroll through
function generateScrollItems(count) {
  const scrollItems = [];
  for (let i = 0; i < count; i++) {
    scrollItems.push(getRandomItem());
  }
  return scrollItems;
}

// Fill roller div with items
function fillRoller(scrollItems) {
  const roller = document.getElementById('roller');
  roller.innerHTML = ''; // clear previous items
  scrollItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'roller-item';

    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;

    const nameDiv = document.createElement('div');
    nameDiv.textContent = item.name;
    nameDiv.style.fontSize = '14px';
    nameDiv.style.marginTop = '4px';

    div.appendChild(img);
    div.appendChild(nameDiv);
    roller.appendChild(div);
  });
}

// Calculate width of one roller item including margin
function getRollerItemWidth() {
  const rollerItem = document.querySelector('.roller-item');
  if (!rollerItem) return 140 + 20; // fallback to 160px (140 + margins)
  const style = getComputedStyle(rollerItem);
  const width = rollerItem.offsetWidth;
  const marginLeft = parseFloat(style.marginLeft);
  const marginRight = parseFloat(style.marginRight);
  return width + marginLeft + marginRight;
}

// Display the odds list below the button
function displayOdds() {
  const oddsListDiv = document.getElementById('oddsList');
  if (!oddsListDiv) return; // safety check if div doesn't exist
  oddsListDiv.innerHTML = ''; // clear previous odds

  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  items.forEach(item => {
    const oddsPercent = ((item.weight / totalWeight) * 100).toFixed(1);
    const p = document.createElement('p');
    p.textContent = ${item.name}: ${oddsPercent}% chance;
    oddsListDiv.appendChild(p);
  });
}

// Initialize odds display on load
displayOdds();

const roller = document.getElementById('roller');
const rollerContainer = document.getElementById('roller-container');
let isRolling = false;

document.getElementById('openCase').addEventListener('click', () => {
  if (isRolling) return; // prevent multiple clicks
  isRolling = true;

  const scrollItemsCount = 30; // how many items to scroll through
  const finalItem = getRandomItem(); // final prize item
  const scrollItems = generateScrollItems(scrollItemsCount);
  scrollItems.push(finalItem); // final item at the end

  fillRoller(scrollItems);

  // Reset roller position
  roller.style.transition = 'none';
  roller.style.left = '0px';

  // Force reflow so transition reset takes effect
  void roller.offsetWidth;

  // Calculate item width dynamically
  const rollerItemWidth = getRollerItemWidth();

  // Calculate scroll distance to center final item
  const containerWidth = rollerContainer.offsetWidth;
  const centerOffset = (containerWidth / 2) - (rollerItemWidth / 2);
  const scrollDistance = (rollerItemWidth * (scrollItems.length - 1)) - centerOffset;

  // Animate scroll
  roller.style.transition = 'left 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
  roller.style.left = -${scrollDistance}px;

  // After animation ends
  roller.addEventListener('transitionend', () => {
    alert(You got: ${finalItem.name}! 🎉);
    isRolling = false;
  }, { once: true });
});
