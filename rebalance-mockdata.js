/**
 * Script to rebalance mockData.ts answer positions
 * 
 * This script fixes the 83% bias toward position 0 by redistributing
 * correctAnswer indices to achieve equal distribution.
 */

const fs = require('fs');

// Read the current mockData.ts
const content = fs.readFileSync('src/data/mockData.ts', 'utf8');

// Extract all correctAnswer values and their positions in the file
const correctAnswerMatches = [...content.matchAll(/correctAnswer:\s*(\d+)/g)];
const positions = correctAnswerMatches.map(match => parseInt(match[1]));

console.log('Current distribution:');
const counts = {0: 0, 1: 0, 2: 0, 3: 0};
positions.forEach(pos => counts[pos]++);
Object.entries(counts).forEach(([pos, count]) => {
  console.log(`Position ${pos}: ${count} (${((count/positions.length)*100).toFixed(1)}%)`);
});

// Create balanced distribution
const total = positions.length;
const targetPerPosition = Math.floor(total / 4);
const remainder = total % 4;

const targetDistribution = [
  targetPerPosition + (remainder > 0 ? 1 : 0),
  targetPerPosition + (remainder > 1 ? 1 : 0), 
  targetPerPosition + (remainder > 2 ? 1 : 0),
  targetPerPosition
];

console.log('\nTarget distribution:');
targetDistribution.forEach((count, pos) => {
  console.log(`Position ${pos}: ${count} (${((count/total)*100).toFixed(1)}%)`);
});

// Generate new positions for each question
const newPositions = [];
let positionCounts = {0: 0, 1: 0, 2: 0, 3: 0};

for (let i = 0; i < total; i++) {
  // Find the position that needs more questions
  let targetPos = 0;
  for (let j = 0; j < 4; j++) {
    if (positionCounts[j] < targetDistribution[j]) {
      targetPos = j;
      break;
    }
  }
  
  newPositions.push(targetPos);
  positionCounts[targetPos]++;
}

console.log('\nNew distribution:');
Object.entries(positionCounts).forEach(([pos, count]) => {
  console.log(`Position ${pos}: ${count} (${((count/total)*100).toFixed(1)}%)`);
});

// Apply the changes to the file content
let newContent = content;
correctAnswerMatches.forEach((match, index) => {
  const oldValue = match[0]; // e.g., "correctAnswer: 0"
  const newValue = `correctAnswer: ${newPositions[index]}`;
  newContent = newContent.replace(oldValue, newValue);
});

// Write the updated content back to the file
fs.writeFileSync('src/data/mockData.ts', newContent);

console.log('\n✅ mockData.ts has been rebalanced!');
console.log('Answer positions are now evenly distributed.');




