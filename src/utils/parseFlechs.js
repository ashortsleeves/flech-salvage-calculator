// src/utils/parseFlechs.js
export function parseFlechsExport(data) {
  if (!data?.sheets) return [];

  return data.sheets.map((sheet) => {
    const name = sheet.designation || "Unknown Mech";
    const pilot = sheet.pilot || {};
    const armor = sheet.armor || {};
    const internal = sheet.internal || {};
    const crits = sheet.crits || {};
    const src = sheet.meta?.srcMTF || "";

    // 1️⃣ Parse equipment layout from srcMTF
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

    // 2️⃣ Compute armor/internal damage
    const armorDamage = Object.values(armor)
      .map((p) => p?.damage || 0)
      .reduce((a, b) => a + b, 0);

    const internalDamage = Object.values(internal)
      .map((p) => p?.damage || 0)
      .reduce((a, b) => a + b, 0);

    // 3️⃣ Identify damaged/destroyed limbs
    const limbStatus = Object.keys({ ...armor, ...internal }).map((loc) => {
      const a = armor[loc]?.damage || 0;
      const i = internal[loc]?.damage || 0;
      const destroyed = i > 0;
      const damaged = a > 0 && !destroyed;
      return { loc: loc.toUpperCase(), damaged, destroyed, armorDamage: a, internalDamage: i };
    });

    // 4️⃣ Map equipment by damage state
    const equipmentByLoc = Object.entries(sections).map(([loc, items]) => {
      const destroyed = limbStatus.find((l) => l.loc === loc.toUpperCase())?.destroyed;
      const damaged = limbStatus.find((l) => l.loc === loc.toUpperCase())?.damaged;
      const critKeys = Object.keys(crits).filter((key) => key.startsWith(loc.slice(0, 2).toUpperCase()));
      const critHits = critKeys.length > 0;

      return {
        loc,
        items,
        destroyed,
        damaged,
        critHits,
      };
    });

    // 5️⃣ Pilot summary
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
      armorDamage,
      internalDamage,
      limbStatus,
      equipmentByLoc,
    };
  });
}
