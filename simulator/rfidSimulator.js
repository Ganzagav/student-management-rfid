import readline from 'readline';

const API_URL = 'http://localhost:5000/api/scan';

const SAMPLE_TAGS = ['TAG_1001', 'TAG_1002', 'TAG_1003', 'TAG_UNKNOWN_99'];

async function sendTagScan(tag) {
  console.log(`\n📡 [RFID Hardware] Swiping card tag: "${tag}"...`);
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rfid_tag: tag }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`✅ SUCCESS (${response.status}): ${data.message}`);
    } else {
      console.log(`❌ ERROR (${response.status}): ${data.message}`);
    }
  } catch (err) {
    console.error('⚠️ Could not connect to backend server at http://localhost:5000');
  }
}

// CLI Interactive Mode
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('----------------------------------------------------');
console.log('🤖 RFID Hardware Simulator CLI');
console.log('----------------------------------------------------');
console.log('Options:');
console.log('  Enter a Tag ID manually (e.g. TAG_1001)');
console.log('  Type "random" to swipe a random card');
console.log('  Type "exit" to quit');
console.log('----------------------------------------------------\n');

function promptUser() {
  rl.question('Scan Tag > ', async (input) => {
    const command = input.trim();

    if (command.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    if (command.toLowerCase() === 'random') {
      const randomTag = SAMPLE_TAGS[Math.floor(Math.random() * SAMPLE_TAGS.length)];
      await sendTagScan(randomTag);
    } else if (command.length > 0) {
      await sendTagScan(command);
    }

    promptUser();
  });
}

promptUser();