# BattleTech Equipment Costs Integration

## Overview

This document describes the equipment cost system integrated into the Flechs Salvage Calculator. The system uses official BattleTech construction rules to calculate accurate repair costs for damaged mechs.

## Files Added

### 1. `src/utils/equipment-costs.json`
A comprehensive database of BattleTech equipment costs including:
- **Fixed Costs**: Cockpit, Life Support, Heat Sinks, etc.
- **Per-Tonnage Costs**: Actuators, Sensors (multiply by mech tonnage)
- **Per-Point Costs**: Armor and Internal Structure (625 and 250 C-Bills respectively)
- **Weapon Costs**: Complete listing of common weapons
- **Ammo Costs**: Ammunition costs per ton
- **Equipment Costs**: Special equipment like CASE, Artemis IV, etc.
- **Formula Components**: For calculating Engine, Gyro, and Jump Jet costs

### 2. `src/utils/calculateRepairCosts.js`
Utility functions for calculating repair costs:

#### Main Functions:
- `calculateComponentCost(componentName, mechTonnage, engineInfo, isDestroyed)` - Calculate individual component costs
- `calculateMechRepairCosts(mechData, srcMTF)` - Calculate total mech repair costs with detailed breakdown
- `formatCBills(amount)` - Format numbers as C-Bills with commas
- `calculateRepairPercentage(repairCost, baseCost)` - Calculate repair cost as % of base cost
- `analyzeSalvageValue(repairCost, baseCost)` - Determine if mech is worth repairing

#### Salvage Ratings:
- **Excellent** (≤25%): Minimal repairs needed
- **Good** (≤50%): Worth repairing
- **Marginal** (≤75%): Consider parts recovery only
- **Poor** (>75%): Scrap for parts

### 3. Updated `src/App.jsx`
Enhanced the main app with:
- Detailed repair cost calculations using actual equipment costs
- Interactive "Show Cost Breakdown" button for each mech
- Color-coded salvage recommendations
- Itemized component repair costs by location
- Breakdown of armor vs internal vs component costs

### 4. Updated `src/utils/parseFlechs.js`
- Now passes the `srcMTF` data through to enable engine rating extraction

## Cost Calculation Rules

### Armor Repair
- **Cost**: 625 C-Bills per point of armor
- **Applied**: To all armor damage

### Internal Structure Repair
- **Cost**: 250 C-Bills per point of internal structure
- **Applied**: To all internal structure damage

### Component Repair/Replacement
Components are only charged if:
1. **Location is destroyed** (all internal structure gone) → Full replacement cost
2. **Location has critical hits** → 50% of replacement cost (repair vs replace)

If a location only has armor damage with no internal or critical hits, components are NOT charged.

## Equipment Cost Formulas

### Fixed Costs
```
Cockpit: 200,000 C-Bills
Life Support: 50,000 C-Bills
Heat Sink (Single): 2,000 C-Bills
```

### Tonnage-Based Costs
```
Sensors: 2,000 × mech tonnage
Shoulder: 80 × mech tonnage
Upper Arm Actuator: 100 × mech tonnage
Lower Arm Actuator: 50 × mech tonnage
Hand Actuator: 80 × mech tonnage
Hip: 80 × mech tonnage
Upper Leg Actuator: 150 × mech tonnage
Lower Leg Actuator: 80 × mech tonnage
Foot Actuator: 120 × mech tonnage
```

### Complex Formulas
```javascript
// Fusion Engine
cost = (5000 × engineRating × mechTonnage) / 75

// Gyro
gyroTonnage = ceil(engineRating / 100)
cost = 300000 × gyroTonnage

// Jump Jets (for all jets on mech)
cost = 200 × (numberOfJumpJets²) × mechTonnage
```

## Usage in the App

### Basic Usage
1. Upload a FlechSheets JSON export
2. View the "Total Repair Cost" in the blue info box
3. See the salvage recommendation (color-coded)
4. Click "Show Cost Breakdown" for detailed itemization

### Cost Breakdown Shows
- Armor repair costs with point count
- Internal structure repair costs with point count
- Component repairs organized by location
- Per-component costs with destroyed/damaged status
- Whether components are fully destroyed or just damaged

## Testing

Run the test script to verify calculations:
```bash
node test-repair-costs.js
```

This will:
- Load the example mech data
- Calculate repair costs for each mech
- Display detailed breakdowns
- Show salvage recommendations

## Example Output

```
--- Mech: Catapult CPLT-C1 ---
Mass: 65 tons

Repair Cost Breakdown:
  Armor Repair: 4,375 C-Bills (7 points damaged)
  Internal Structure: 0 C-Bills (0 points damaged)
  Component Repairs: 0 C-Bills

TOTAL REPAIR COST: 4,375 C-Bills
Estimated as 0.7% of base cost
Recommendation: Excellent salvage - minimal repairs needed
```

## Data Sources

Equipment costs are based on:
- **BattleTech Total Warfare** - Official construction rules
- **BattleTech Repair Tables** - Standard repair costs
- **Community Resources** - Verified cost tables from Sarna.net and official forums

## Future Enhancements

Potential additions:
- [ ] Support for Clan equipment (different costs)
- [ ] Advanced structure types (Endo-Steel, Composite)
- [ ] Advanced armor types (Ferro-Fibrous, Reactive, etc.)
- [ ] Tech level modifiers (downgrade/upgrade equipment)
- [ ] Repair time estimates based on equipment complexity
- [ ] Spare parts inventory tracking
- [ ] Campaign-based part availability modifiers

## Notes

- All costs are in C-Bills (the standard BattleTech currency)
- Costs represent replacement/repair costs, not salvage sale values
- The system assumes standard Inner Sphere technology
- Damaged components cost 50% of full replacement (repair vs replace)
- Unknown components default to 5,000 C-Bills (logged to console)

## Contributing

When adding new equipment:
1. Add to the appropriate section in `equipment-costs.json`
2. Update pattern matching in `calculateComponentCost()` if needed
3. Test with example mechs that use the equipment
4. Document any special calculation rules

