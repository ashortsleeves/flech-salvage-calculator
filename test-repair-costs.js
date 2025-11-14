// Quick test script to verify repair cost calculations
// Run with: node test-repair-costs.js

import { readFileSync } from 'fs';
import { parseFlechsExport } from './src/utils/parseFlechs.js';
import { calculateMechRepairCosts, formatCBills, analyzeSalvageValue } from './src/utils/calculateRepairCosts.js';
import internalStructureTable from './src/utils/internal-structure-table.json' assert { type: 'json' };
import equipmentCosts from './src/utils/equipment-costs.json' assert { type: 'json' };

// Load the example data
const exampleData = JSON.parse(readFileSync('./example-mech-doc.json', 'utf-8'));

// Parse the mechs
const mechs = parseFlechsExport(exampleData);

console.log('=== FLECHS SALVAGE CALCULATOR TEST ===\n');

mechs.forEach((mech, idx) => {
  console.log(`\n--- Mech ${idx + 1}: ${mech.name} ---`);
  console.log(`Mass: ${mech.mass} tons`);
  console.log(`Pilot: Gunnery ${mech.pilot.gunnery}, Piloting ${mech.pilot.piloting} (${mech.pilot.status})`);
  
  // Calculate repair costs
  const costs = calculateMechRepairCosts(mech, mech.srcMTF);
  
  console.log(`\nRepair Cost Breakdown:`);
  console.log(`  Armor Repair: ${formatCBills(costs.totalArmorCost)}`);
  console.log(`    (${mech.armorDamageAmount} points damaged)`);
  console.log(`  Internal Structure: ${formatCBills(costs.totalInternalCost)}`);
  console.log(`    (${mech.internalDamageAmount} points damaged)`);
  console.log(`  Component Repairs: ${formatCBills(costs.totalComponentCost)}`);
  
  if (costs.components.length > 0) {
    console.log(`\n  Damaged/Destroyed Components by Location:`);
    costs.components.forEach(loc => {
      console.log(`    ${loc.location} (${loc.destroyed ? 'DESTROYED' : 'DAMAGED'}): ${formatCBills(loc.totalCost)}`);
      loc.items.forEach(item => {
        console.log(`      - ${item.name}: ${formatCBills(item.cost)}`);
      });
    });
  }
  
  console.log(`\n  TOTAL REPAIR COST: ${formatCBills(costs.grandTotal)}`);
  
  // Estimate base cost (rough estimate for testing)
  const estimatedBaseCost = mech.mass * 10000; // Rough estimate
  const analysis = analyzeSalvageValue(costs.grandTotal, estimatedBaseCost);
  console.log(`  Estimated as ${analysis.percentOfCost?.toFixed(1)}% of base cost`);
  console.log(`  Recommendation: ${analysis.recommendation}`);
});

console.log('\n=== TEST COMPLETE ===\n');

