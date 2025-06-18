// Your existing case opener code
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

const currentCaseName = "Final nail in the coffin";
const items = cases[currentCaseName];
document.getElementById('caseTitle').textContent = currentCaseName;

function getRandomItem() {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    if (random < item.weight) return item;
    random -= item.weight;
  }
}

function generateScrollItems(count) {
  const scrollItems = [];
  for (let i = 0; i < count; i++) {
    scrollItems.push(getRandomItem());
  }
  return scrollItems;
}

function fillRoller(scrollItems) {
  const roller = document.getElementById('roller');
  roller.innerHTML = '';
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

function getRollerItemWidth() {
  const rollerItem = document.querySelector('.roller-item');
  if (!rollerItem) return 140 + 20;
  const style = getComputedStyle(rollerItem);
  const width = rollerItem.offsetWidth;
  const marginLeft = parseFloat(style.marginLeft);
  const marginRight = parseFloat(style.marginRight);
  return width + marginLeft + marginRight;
}

function displayOdds() {
  const oddsListDiv = document.getElementById('oddsList');
  if (!oddsListDiv) return;
  oddsListDiv.innerHTML = '';

  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  items.forEach(item => {
    const oddsPercent = ((item.weight / totalWeight) * 100).toFixed(1);
    const p = document.createElement('p');
    p.textContent = `${item.name}: ${oddsPercent}% chance`;
    oddsListDiv.appendChild(p);
  });
}

displayOdds();

const roller = document.getElementById('roller');
const rollerContainer = document.getElementById('roller-container');
let isRolling = false;

document.getElementById('openCase').addEventListener('click', () => {
  if (isRolling) return;
  isRolling = true;

  const scrollItemsCount = 30;
  const finalItem = getRandomItem();
  const scrollItems = generateScrollItems(scrollItemsCount);
  scrollItems.push(finalItem);

  fillRoller(scrollItems);

  roller.style.transition = 'none';
  roller.style.left = '0px';

  void roller.offsetWidth;

  const rollerItemWidth = getRollerItemWidth();
  const containerWidth = rollerContainer.offsetWidth;
  const centerOffset = (containerWidth / 2) - (rollerItemWidth / 2);
  const scrollDistance = (rollerItemWidth * (scrollItems.length - 1)) - centerOffset;

  roller.style.transition = 'left 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
  roller.style.left = `-${scrollDistance}px`;

  roller.addEventListener('transitionend', () => {
    alert(`You got: ${finalItem.name}! 🎉`);
    isRolling = false;
  }, { once: true });
});

// ======= Supabase Chat Integration =======

// Load Supabase JS SDK dynamically
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/supabase.min.js';
script.onload = () => {
  const supabaseUrl = 'https://rkxkrfjeqtxrkbgjutvf.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJreGtyZmplcXR4cmtiZ2p1dHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyODEwMDUsImV4cCI6MjA2NTg1NzAwNX0.sJjLFBn3FZRwjJNRuRozzNea85CK7KYa_QGRZcVvmeA';
  const supabase = supabasejs.createClient(supabaseUrl, supabaseKey);

  const messagesDiv = document.getElementById('messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');

  function addMessage(message) {
    const div = document.createElement('div');
    div.textContent = message;
    div.style.padding = '6px 0';
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // Load last 50 messages
  async function loadMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }
    data.forEach(msg => addMessage(`${msg.username || 'Anon'}: ${msg.content}`));
  }

  loadMessages();

  // Realtime subscription to new messages
  supabase
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
      addMessage(`${payload.new.username || 'Anon'}: ${payload.new.content}`);
    })
    .subscribe();

  // Send message handler
  chatForm.addEventListener('submit', async e => {
    e.preventDefault();
    const content = chatInput.value.trim();
    if (!content) return;
    const { error } = await supabase
      .from('messages')
      .insert([{ content, username: 'Anonymous' }]);
    if (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
      return;
    }
    chatInput.value = '';
  });
};
document.head.appendChild(script);
