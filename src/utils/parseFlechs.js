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
      
      //NEEDS REWORK
      const destroyed = i > 0;
      const damaged = a > 0 && !destroyed;


      src.split("\n").forEach((line) => {
        line = line.trim();
        if (!line) return;
        let location = loc;

        if (loc === "LTR") {
          location = "RTL";
        }
        if (loc === "CTR") {
          location = "RTC";
        }

        if (line.includes(location + " Armor:")) {
          const match = line.match(/Armor:\s*(\d+)/);
          armorDefault = parseInt(match[1], 10);
          a = armorDefault - a;
        }
      });

      return { loc: loc.toUpperCase(), damaged, destroyed,   armorDefault: armorDefault, armorDamage: a, internalDamage: i };
    });

    // Map equipment by damage state
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
    };
  });
}
