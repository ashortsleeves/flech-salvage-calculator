// src/utils/calculateRepairCosts.js
import equipmentCosts from './equipment-costs.json' assert { type: 'json' };

/**
 * Calculate the cost to replace or repair a specific component
 * @param {string} componentName - Name of the component
 * @param {number} mechTonnage - Tonnage of the mech
 * @param {object} engineInfo - Engine rating info {rating: number}
 * @param {boolean} isDestroyed - Whether component is destroyed (vs just damaged)
 * @returns {number} Cost in C-Bills
 */
export function calculateComponentCost(componentName, mechTonnage, engineInfo = {}, isDestroyed = true) {
  const name = componentName.trim();
  
  // Fixed cost items
  if (equipmentCosts.fixedCosts[name] !== undefined) {
    return equipmentCosts.fixedCosts[name] * (isDestroyed ? 1 : 0.5);
  }
  
  // Per-tonnage cost items
  if (equipmentCosts.perTonnageCosts[name] !== undefined) {
    return equipmentCosts.perTonnageCosts[name] * mechTonnage * (isDestroyed ? 1 : 0.5);
  }
  
  // Weapons
  if (equipmentCosts.weaponCosts[name] !== undefined) {
    return equipmentCosts.weaponCosts[name] * (isDestroyed ? 1 : 0.5);
  }
  
  // Ammo
  if (equipmentCosts.ammoCosts[name] !== undefined) {
    return equipmentCosts.ammoCosts[name] * (isDestroyed ? 1 : 0.5);
  }
  
  // Equipment
  if (equipmentCosts.equipmentCosts[name] !== undefined) {
    return equipmentCosts.equipmentCosts[name] * (isDestroyed ? 1 : 0.5);
  }
  
  // Special cases
  if (name === "Fusion Engine" && engineInfo.rating) {
    return ((5000 * engineInfo.rating * mechTonnage) / 75) * (isDestroyed ? 1 : 0.5);
  }
  
  if (name === "Gyro" && engineInfo.rating) {
    const gyroTonnage = Math.ceil(engineInfo.rating / 100);
    return 300000 * gyroTonnage * (isDestroyed ? 1 : 0.5);
  }
  
  // Pattern matching for variations
  if (name.includes("Laser")) {
    if (name.includes("Medium")) return equipmentCosts.weaponCosts["Medium Laser"] * (isDestroyed ? 1 : 0.5);
    if (name.includes("Small")) return equipmentCosts.weaponCosts["Small Laser"] * (isDestroyed ? 1 : 0.5);
    if (name.includes("Large")) return equipmentCosts.weaponCosts["Large Laser"] * (isDestroyed ? 1 : 0.5);
  }
  
  if (name.includes("Jump Jet")) {
    // Default cost for a single jump jet
    return 50000 * (isDestroyed ? 1 : 0.5);
  }
  
  if (name.includes("CASE")) {
    return equipmentCosts.equipmentCosts["CASE"] * (isDestroyed ? 1 : 0.5);
  }
  
  // Return 0 for unknown items or empty slots
  if (name.startsWith("-Empty-") || name === "") {
    return 0;
  }
  
  // Unknown component - return estimated cost based on mech tonnage
  console.warn(`Unknown component: ${name}`);
  return 5000 * (isDestroyed ? 1 : 0.5); // Default fallback cost
}

/**
 * Extract engine rating from the MTF source data
 * @param {string} srcMTF - The MTF format string
 * @returns {number} Engine rating
 */
export function parseEngineRating(srcMTF) {
  const match = srcMTF.match(/Engine:(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Calculate total repair costs for a mech
 * @param {object} mechData - Parsed mech data from parseFlechs
 * @param {string} srcMTF - Source MTF data
 * @returns {object} Detailed cost breakdown
 */
export function calculateMechRepairCosts(mechData, srcMTF = "") {
  const engineRating = parseEngineRating(srcMTF);
  const engineInfo = { rating: engineRating };
  
  const costs = {
    armor: 0,
    internalStructure: 0,
    components: [],
    totalComponentCost: 0,
    totalArmorCost: 0,
    totalInternalCost: 0,
    grandTotal: 0
  };
  
  // Calculate armor repair costs
  const armorDamagePoints = mechData.armorDamageAmount || 0;
  costs.totalArmorCost = armorDamagePoints * equipmentCosts.perPointCosts["Standard"];
  costs.armor = costs.totalArmorCost;
  
  // Calculate internal structure repair costs
  const internalDamagePoints = mechData.internalDamageAmount || 0;
  costs.totalInternalCost = internalDamagePoints * equipmentCosts.perPointCosts["Standard Internal Structure"];
  costs.internalStructure = costs.totalInternalCost;
  
  // Calculate component repair costs
  // Only charge for components if the location is destroyed OR there are critical hits
  if (mechData.equipmentByLoc) {
    mechData.equipmentByLoc.forEach(location => {
      // Only process locations that are destroyed or have critical hits
      if (!location.destroyed && !location.critHits) {
        return; // Skip this location - components are fine
      }
      
      const locCosts = {
        location: location.loc,
        destroyed: location.destroyed,
        damaged: location.damaged,
        critHits: location.critHits,
        items: [],
        totalCost: 0
      };
      
      location.items.forEach(item => {
        // If location is destroyed, all components are destroyed
        // If there are just crit hits but location not destroyed, components are damaged (50% cost)
        const isDestroyed = location.destroyed;
        
        const itemCost = calculateComponentCost(
          item.name,
          mechData.mass,
          engineInfo,
          isDestroyed
        );
        
        if (itemCost > 0) {
          locCosts.items.push({
            name: item.name,
            cost: itemCost,
            destroyed: isDestroyed
          });
          locCosts.totalCost += itemCost;
        }
      });
      
      if (locCosts.totalCost > 0) {
        costs.components.push(locCosts);
        costs.totalComponentCost += locCosts.totalCost;
      }
    });
  }
  
  costs.grandTotal = costs.totalArmorCost + costs.totalInternalCost + costs.totalComponentCost;
  
  return costs;
}

/**
 * Format C-Bills with commas and suffix
 * @param {number} amount - Amount in C-Bills
 * @returns {string} Formatted string
 */
export function formatCBills(amount) {
  return `${amount.toLocaleString()} C-Bills`;
}

/**
 * Calculate percentage of mech's base cost
 * @param {number} repairCost - Total repair cost
 * @param {number} baseCost - Mech's base cost
 * @returns {string} Percentage as string
 */
export function calculateRepairPercentage(repairCost, baseCost) {
  if (!baseCost || baseCost === 0) return "N/A";
  return `${((repairCost / baseCost) * 100).toFixed(1)}%`;
}

/**
 * Determine if mech is economically salvageable
 * Based on common BattleTech house rules (>50% cost = not worth repairing)
 * @param {number} repairCost - Total repair cost
 * @param {number} baseCost - Mech's base cost
 * @returns {object} Analysis with recommendation
 */
export function analyzeSalvageValue(repairCost, baseCost) {
  if (!baseCost || baseCost === 0) {
    return {
      salvageable: null,
      recommendation: "Unknown - base cost not available",
      percentOfCost: null
    };
  }
  
  const percent = (repairCost / baseCost) * 100;
  
  if (percent <= 25) {
    return {
      salvageable: true,
      recommendation: "Excellent salvage - minimal repairs needed",
      percentOfCost: percent,
      rating: "excellent"
    };
  } else if (percent <= 50) {
    return {
      salvageable: true,
      recommendation: "Good salvage - worth repairing",
      percentOfCost: percent,
      rating: "good"
    };
  } else if (percent <= 75) {
    return {
      salvageable: "questionable",
      recommendation: "Marginal salvage - consider parts recovery only",
      percentOfCost: percent,
      rating: "marginal"
    };
  } else {
    return {
      salvageable: false,
      recommendation: "Poor salvage - scrap for parts",
      percentOfCost: percent,
      rating: "poor"
    };
  }
}

