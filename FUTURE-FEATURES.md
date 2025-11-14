# Future Features TODO

## Campaign & Inventory Management System

### 🎯 Overview
Transform the app from a simple damage calculator into a full mercenary unit campaign management tool where players can manage C-Bills, mech inventory, and salvaged parts across multiple battles.

---

## 📋 Feature Breakdown

### 1. C-Bill Balance Tracking
**Priority**: High  
**Status**: Not Started

- [ ] Add input field at top of page for current C-Bill balance
- [ ] Persist C-Bill balance in app state
- [ ] Display running total as user makes repair/salvage decisions
- [ ] Show affordability indicators (can/cannot afford repair)

**UI Mockup**:
```
┌─────────────────────────────────────┐
│  💰 C-Bills: [________] 1,500,000   │
│  📦 Owned Mechs: 3  |  🔧 Parts: 47 │
└─────────────────────────────────────┘
```

---

### 2. Repair vs Salvage Decision System
**Priority**: High  
**Status**: Not Started

For each damaged mech in uploaded FlechSheets data:

**Option A: Repair & Keep**
- [ ] Button: "Repair Mech (XXX,XXX C-Bills)"
- [ ] Deduct repair cost from C-Bill balance
- [ ] Add mech to owned mechs inventory (fully repaired)
- [ ] Disable button if insufficient funds
- [ ] Show confirmation dialog with cost breakdown

**Option B: Scrap for Parts**
- [ ] Button: "Salvage for Parts"
- [ ] Extract all functional/repairable components
- [ ] Add components to equipment inventory with quantities
- [ ] Calculate salvage value (sell parts for C-Bills)
- [ ] Show preview of parts that will be recovered

**UI Mockup**:
```
╔══════════════════════════════════════════╗
║ Catapult CPLT-C1                          ║
║ Repair Cost: 4,375 C-Bills               ║
║                                           ║
║ [Repair & Keep (4,375 C-Bills)] [Salvage]║
╚══════════════════════════════════════════╝
```

---

### 3. JSON State Management
**Priority**: High  
**Status**: Not Started

#### Export System State
- [ ] Create `exportCampaignState()` function
- [ ] Button: "Export Campaign Data"
- [ ] Generate JSON file with structure:
  ```json
  {
    "version": "1.0",
    "campaignName": "My Mercenary Unit",
    "lastUpdated": "2025-11-14T...",
    "cBills": 1500000,
    "ownedMechs": [
      {
        "designation": "Atlas AS7-D",
        "mass": 100,
        "condition": "operational",
        "pilot": {...},
        "armor": {...},
        "equipment": {...}
      }
    ],
    "equipmentInventory": [
      {
        "name": "Medium Laser",
        "quantity": 5,
        "condition": "functional",
        "cost": 40000
      },
      {
        "name": "Heat Sink",
        "quantity": 12,
        "condition": "functional",
        "cost": 2000
      }
    ]
  }
  ```
- [ ] Trigger browser download of JSON file
- [ ] Filename format: `campaign-{date}.json`

#### Import System State
- [ ] Add second file uploader: "Load Campaign Data"
- [ ] Parse campaign JSON file
- [ ] Restore C-Bill balance
- [ ] Restore owned mechs list
- [ ] Restore equipment inventory
- [ ] Validate JSON structure and show errors if invalid
- [ ] Merge option: Import additional mechs/equipment vs replace all

---

### 4. Parts-Based Repair System
**Priority**: Medium  
**Status**: Not Started

Allow users to repair mechs using parts from inventory instead of paying full C-Bill cost.

#### Equipment Inventory Display
- [ ] Create inventory sidebar/panel showing all parts
- [ ] Group by category: Weapons, Actuators, Heat Sinks, etc.
- [ ] Show quantity available for each part
- [ ] Show value of each part

#### Part Selection for Repairs
- [ ] When viewing mech repair breakdown, show "Use Parts" option
- [ ] For each damaged component, check if part exists in inventory
- [ ] UI to select parts from inventory vs paying C-Bills
- [ ] Mixed mode: Use some parts, pay C-Bills for rest
- [ ] Real-time cost calculation as parts are selected
- [ ] Validate part compatibility (e.g., correct tonnage for actuators)

**UI Mockup**:
```
╔═══════════════════════════════════════════╗
║ Right Torso Repairs:                       ║
║                                            ║
║ ✓ Medium Laser: 40,000 C-Bills            ║
║   [Use from Inventory (5 available)] [Pay]║
║                                            ║
║ ✓ Heat Sink: 2,000 C-Bills                ║
║   [Use from Inventory (12 available)] [Pay]║
║                                            ║
║ Subtotal: 0 C-Bills (2 parts used)        ║
╚═══════════════════════════════════════════╝
```

#### Part Usage Logic
- [ ] Decrement part quantity when used for repairs
- [ ] Mark parts as "used" or "installed"
- [ ] Track which parts are in which mechs
- [ ] Prevent using parts that are installed in other mechs

---

### 5. Owned Mechs Management
**Priority**: Medium  
**Status**: Not Started

- [ ] Create "My Mechs" view/tab
- [ ] Display all owned mechs with status
- [ ] Show mech condition (operational, damaged, mothballed)
- [ ] Edit mech details (pilot assignment, nickname, etc.)
- [ ] Option to strip parts from owned mechs to inventory
- [ ] Option to sell mechs for C-Bills
- [ ] Calculate total stable value

**UI Features**:
- [ ] Grid/card layout for mechs
- [ ] Quick stats: tonnage, condition, weapons
- [ ] Visual damage indicators
- [ ] Filter by status, weight class, manufacturer

---

### 6. Equipment Inventory Management
**Priority**: Medium  
**Status**: Not Started

- [ ] Create "Equipment Inventory" view/tab
- [ ] Categorize parts (Weapons, Actuators, Engines, etc.)
- [ ] Search/filter functionality
- [ ] Sort by name, value, quantity
- [ ] Option to sell parts for C-Bills
- [ ] Show market value vs cost
- [ ] Batch operations (sell all heat sinks, etc.)

**Features**:
- [ ] Low stock warnings
- [ ] Total inventory value display
- [ ] Recently acquired parts highlight
- [ ] Part condition tracking (pristine, used, damaged)

---

### 7. Salvage Logic Enhancements
**Priority**: Low  
**Status**: Not Started

When scrapping a mech for parts:

- [ ] Only salvage undamaged components
- [ ] Damaged components have chance to be recovered (roll dice)
- [ ] Destroyed components cannot be salvaged
- [ ] Critical hit components may be damaged but salvageable
- [ ] Add randomness option for realistic salvage
- [ ] Calculate salvage time (days to strip mech)

**Salvage Rules**:
```
Component Status          → Salvage Result
─────────────────────────────────────────
Intact                   → 100% recovered
Damaged (armor only)     → 100% recovered
Damaged (crit hit)       → 75% chance, reduced condition
Destroyed location       → 25% chance, damaged condition
```

---

### 8. Campaign Financial Features
**Priority**: Low  
**Status**: Not Started

- [ ] Track income/expenses over time
- [ ] Contract payments system
- [ ] Repair contracts (pay to repair salvage for others)
- [ ] Parts market (buy parts at markup)
- [ ] Loans/credit system
- [ ] Financial reports and charts

---

### 9. Advanced Features (Nice to Have)
**Priority**: Very Low  
**Status**: Not Started

- [ ] Multi-player campaign support (shared inventory)
- [ ] Time tracking (campaign date/time)
- [ ] Tech advancement tracking (unlock tech levels)
- [ ] Pilot roster management
- [ ] Battle history log
- [ ] Achievement system
- [ ] Auto-backup to cloud/localStorage
- [ ] Mobile responsive design improvements
- [ ] Dark mode theme
- [ ] Print-friendly mech sheets

---

## 🗂️ Data Structures

### Campaign State Object
```typescript
interface CampaignState {
  version: string;
  campaignName: string;
  created: string;
  lastUpdated: string;
  cBills: number;
  ownedMechs: OwnedMech[];
  equipmentInventory: EquipmentItem[];
  battleHistory: Battle[];
  pilots: Pilot[];
  settings: CampaignSettings;
}
```

### Equipment Item
```typescript
interface EquipmentItem {
  id: string;
  name: string;
  category: 'weapon' | 'ammo' | 'actuator' | 'heatsink' | 'engine' | 'gyro' | 'equipment';
  quantity: number;
  condition: 'pristine' | 'functional' | 'damaged';
  baseCost: number;
  marketValue: number;
  techLevel: 'IS' | 'Clan';
  requiredTonnage?: number; // For tonnage-specific parts
  acquiredDate: string;
  source: 'purchase' | 'salvage' | 'contract';
}
```

### Owned Mech
```typescript
interface OwnedMech {
  id: string;
  designation: string;
  nickname?: string;
  mass: number;
  status: 'operational' | 'damaged' | 'repairing' | 'mothballed';
  condition: number; // 0-100%
  pilot?: Pilot;
  armor: ArmorState;
  internal: InternalState;
  equipment: EquipmentState;
  acquiredDate: string;
  totalRepairCost?: number;
  marketValue: number;
}
```

---

## 🎨 UI/UX Considerations

### Navigation Structure
```
App Layout:
├─ Header
│  ├─ C-Bill Balance Display
│  ├─ Quick Stats (Mechs, Parts)
│  └─ Import/Export Buttons
├─ Navigation Tabs
│  ├─ "Damage Assessment" (current functionality)
│  ├─ "My Mechs" (owned mech hangar)
│  ├─ "Equipment Inventory" (parts warehouse)
│  └─ "Campaign Summary" (finances, history)
└─ Main Content Area
```

### Color Coding
- 🟢 Green: Can afford, good salvage
- 🟡 Yellow: Marginal decision, warning
- 🔴 Red: Cannot afford, poor salvage
- 🔵 Blue: Information, neutral
- ⚪ Gray: Disabled, unavailable

---

## 📝 Implementation Notes

### Phase 1: Core Features (MVP)
1. C-Bill balance tracking
2. Basic repair/salvage buttons
3. Simple equipment inventory list
4. Export/import JSON functionality

### Phase 2: Enhanced Features
1. Parts-based repair system
2. Owned mechs management
3. Inventory categorization
4. Financial tracking

### Phase 3: Polish
1. Advanced salvage logic
2. UI/UX improvements
3. Mobile optimization
4. Additional campaign features

---

## 🧪 Testing Checklist

- [ ] Test with various mech damage states
- [ ] Test C-Bill balance calculations (positive and negative)
- [ ] Test part inventory add/remove operations
- [ ] Test JSON export/import with large datasets
- [ ] Test edge cases (0 C-Bills, 0 parts, etc.)
- [ ] Test browser compatibility
- [ ] Test file download/upload on different browsers
- [ ] Performance test with 50+ mechs and 500+ parts

---

## 📚 Resources

- BattleTech: Campaign Operations rulebook
- BattleTech: Strategic Operations (salvage rules)
- MegaMek lab for reference data
- FlechSheets JSON format documentation

---

**Last Updated**: 2025-11-14  
**Document Version**: 1.0

