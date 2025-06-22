// === CS2 Case Opener with Balance and localStorage ===

// Define cases data
const cases = {
  "Final nail in the coffin": [
    { name: "Nail", weight: 70, image: "images/nail.jpg" },
    { name: "Hammer", weight: 25, image: "images/hammer.jpg" },
    { name: "Coffin", weight: 5, image: "images/coffin.jpg" },
  ],
  "10% Cotton": [
    { name: "T-Shirt", weight: 60, image: "images/cotton_ball.jpg" },
    { name: "jeans", weight: 30, image: "images/cotton_gloves.jpg" },
    { name: "Cotton bag", weight: 10, image: "images/cotton_tshirt.jpg" },
  ],
  "Lucky Mutant": [
    { name: "Mutant Claw", weight: 50, image: "images/mutant_eye.jpg" },
    { name: "Mutant Eye", weight: 35, image: "images/mutant_claw.jpg" },
    { name: "Mutant Heart", weight: 15, image: "images/mutant_heart.jpg" },
  ]
};

// === NEW: Balance system with localStorage ===
const caseCost = 20;

// Load balance from localStorage or start with 100
let balance = Number(localStorage.getItem('balance'));
if (isNaN(balance)) {
  balance = 100;
}

const itemValues = {
  "Nail": 5,
  "Hammer": 15,
  "Coffin": 50,
  "Cotton Ball": 10,
  "Cotton Gloves": 20,
  "Cotton T-Shirt": 40,
  "Mutant Eye": 25,
  "Mutant Claw": 35,
  "Mutant Heart": 60
};

function updateBalanceDisplay() {
  const balanceElement = document.getElementById('balance');
  if (balanceElement) {
    balanceElement.textContent = `Balance: ${balance}`;
  }
  // Save balance to localStorage
  localStorage.setItem('balance', balance);
}

function resetBalance() {
  balance = 100;
  updateBalanceDisplay();
}

// Initialize balance display on page load
updateBalanceDisplay();

// Add event listener for reset button
const resetBtn = document.getElementById('resetBalance');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to reset your balance to 100?")) {
      resetBalance();
    }
  });
}

// === === ===
// Choose which case to open here:
const currentCaseName = "Final nail in the coffin";
const items = cases[currentCaseName];

// Update the title in HTML
document.getElementById('caseTitle').textContent = currentCaseName;

// Fixed weighted random item selection
function getRandomItem() {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    if (random < item.weight) return item;
    random -= item.weight;
  }
  return items[items.length - 1]; // fallback
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
    p.textContent = `${item.name}: ${oddsPercent}% chance`;
    oddsListDiv.appendChild(p);
  });
}

// Initialize odds display on load
displayOdds();

const roller = document.getElementById('roller');
const rollerContainer = document.getElementById('roller-container');
let isRolling = false;

function openCase() {
  if (isRolling) return;

  if (balance < caseCost) {
    alert("Not enough balance to open this case!");
    return;
  }

  balance -= caseCost;
  updateBalanceDisplay();

  isRolling = true;

  const scrollItemsCount = 30;
  const finalItem = getRandomItem();
  const scrollItems = generateScrollItems(scrollItemsCount);
  scrollItems.push(finalItem);

  fillRoller(scrollItems);

  roller.style.transition = 'none';
  roller.style.left = '0px';

  void roller.offsetWidth; // force reflow

  const rollerItemWidth = getRollerItemWidth();
  const containerWidth = rollerContainer.offsetWidth;
  const centerOffset = (containerWidth / 2) - (rollerItemWidth / 2);
  const scrollDistance = (rollerItemWidth * (scrollItems.length - 1)) - centerOffset;

  roller.style.transition = 'left 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
  roller.style.left = `-${scrollDistance}px`;

  // Remove old listeners and add new one
  roller.replaceWith(roller.cloneNode(true));
  const newRoller = document.getElementById('roller');

  newRoller.addEventListener('transitionend', () => {
    const reward = itemValues[finalItem.name] || 0;
    balance += reward;
    updateBalanceDisplay();
    alert(`You got: ${finalItem.name}! 🎉 You earned ${reward}.`);
    isRolling = false;
  }, { once: true });
}

document.getElementById('openCase').addEventListener('click', openCase);
