// src/utils/parseFlechs.js

import isTable from "./internal-structure-table.json";

function mapLocToISType(loc) {
  loc = loc.toUpperCase();

  // REAR TORSO collapse to same class as front torso
  if (loc === "CTR") return "CT";
  if (loc === "LTR" || loc === "RTR") return "ST";

  // FRONT
  if (loc === "CT") return "CT";
  if (loc === "LT" || loc === "RT") return "ST";

  // ARMS and LEGS
  if (loc === "LA" || loc === "RA") return "ARM";
  if (loc === "LL" || loc === "RL") return "LEG";

  if (loc === "HD") return "HEAD";

  return null;
}


export function parseFlechsExport(data) {
  if (!data?.sheets) return [];

  return data.sheets.map((sheet) => {
    const name = sheet.designation || "Unknown Mech";
    const pilot = sheet.pilot || {};
    const armor = sheet.armor || {};
    const internal = sheet.internal || {};
    const crits = sheet.crits || {};
    const src = sheet.meta?.srcMTF || "";

    // Parse equipment layout from srcMTF
    const sections = {};
    let currentSection = null;
    src.split("\n").forEach((line) => {
      line = line.trim();
      if (!line) return;

      // Detect location header (e.g., "Left Arm:")
      if (line.endsWith(":")) {
        currentSection = line.replace(":", "");
        sections[currentSection] = [];
      }
      // Detect equipment lines
      else if (currentSection && !line.startsWith("-")) {
        sections[currentSection].push(line);
      }
    });

    const armorMTF = [];
    src.split("\n").forEach((line) => {
      line = line.trim();
      if (!line) return;

      if (line.includes(" Armor:")) {
        console.log(line);
        armorMTF.push(line);
      }
    });

    // Compute armor/internal damage
    const armorDamage = Object.values(armor)
      .map((p) => p?.damage || 0)
      .reduce((a, b) => a + b, 0);

    const internalDamage = Object.values(internal)
      .map((p) => p?.damage || 0)
      .reduce((a, b) => a + b, 0);

    // Identify damaged/destroyed limbs
const limbStatus = Object.keys({ ...armor, ...internal }).map((loc) => {
  let a = armor[loc]?.damage || 0;
  let armorDefault = "";
  const i = internal[loc]?.damage || 0;

  // Armor default lookup
  src.split("\n").forEach((line) => {
    line = line.trim();
    if (!line) return;

    if (new RegExp(loc + "\\s+armor:", "i").test(line)) {
      const match = line.match(/armor:\s*(\d+)/i);
      armorDefault = parseInt(match[1], 10);
      a = armorDefault - a;
    }
  });

  // INTERNAL default lookup
  const mechMass = sheet?.meta?.mass;
  const isKey = mapLocToISType(loc);
  const internalDefault = isTable[mechMass]?.[isKey] ?? 0;
  const internalRemaining = internalDefault - i;

  // destroyed actually means fully stripped internal
  const destroyed = internalRemaining <= 0;
  const damaged = !destroyed && (a < armorDefault || i > 0);
  // totals

  return {
    loc: loc.toUpperCase(),
    armorDefault,
    armorDamage: a,
    internalDamage: i,
    internalDefault,
    internalRemaining,
    destroyed,
    damaged,
  };
});


    // Map equipment by damage state
    const equipmentByLoc = Object.entries(sections).map(([loc, items]) => {
      const destroyed = limbStatus.find((l) => l.loc === loc.toUpperCase())?.destroyed;
      const damaged = limbStatus.find((l) => l.loc === loc.toUpperCase())?.damaged;
      const critKeys = Object.keys(crits).filter((key) => key.startsWith(loc.slice(0, 2).toUpperCase()));
      const critHits = critKeys.length > 0;

      const destroyedItemFlags = items.map(item => destroyed ? true : false);

      return {
        loc,
        items: items.map((item, idx) => ({
          name: item,
          destroyed: destroyedItemFlags[idx]
        })),
        destroyed,
        damaged,
        critHits,
      };
    });
  const defaultTotalArmor = limbStatus.reduce((sum, l) => sum + (l.armorDefault || 0), 0);
  const defaultTotalInternal = limbStatus.reduce((sum, l) => sum + (l.internalDefault || 0), 0);

  const totalArmorRemaining = limbStatus.reduce((sum, l) => sum + (l.armorDamage || 0), 0);
  const totalInternalRemaining = limbStatus.reduce((sum, l) => sum + (l.internalRemaining || 0), 0);

  const armorDamageAmount = defaultTotalArmor - totalArmorRemaining;
  const internalDamageAmount = defaultTotalInternal - totalInternalRemaining;
  
    // Pilot summary
  const pilotStatus =
      pilot?.wounds?.some((w) => w !== "ok") ? "WOUNDED" : "OK";

  return {
    name,
    mass: sheet?.meta?.mass || "N/A",
    pilot: {
      gunnery: pilot?.gunnery ?? "?",
      piloting: pilot?.piloting ?? "?",
      status: pilotStatus,
    },
    armorMTF,
    armorDamage,
    internalDamage,
    limbStatus,
    equipmentByLoc,
    defaultTotalArmor,
    defaultTotalInternal,
    totalArmorRemaining,
    totalInternalRemaining,
    armorDamageAmount,
    internalDamageAmount,
  };
  });
}
