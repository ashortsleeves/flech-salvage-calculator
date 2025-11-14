import { useState } from "react";
import FileUploader from "./components/FileUploader";
import { parseFlechsExport } from "./utils/parseFlechs";
import mechList from './mech-list.json';

export default function App() {
  const [mechs, setMechs] = useState([]);
  const [manualCosts, setManualCosts] = useState({});

  const handleFile = (json) => setMechs(parseFlechsExport(json));

  const setCostOverride = (mechName, value) => {
    setManualCosts((prev) => ({ ...prev, [mechName]: parseInt(value) }));
  };

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">Flechs Salvage Calculator</h1>
      <FileUploader onFileLoaded={handleFile} />

      {mechs.map((mech, idx) => {
        
        const match = mechList.find(m => m.name === mech.name);
        const baseCost = manualCosts[mech.name]
          ? manualCosts[mech.name]
          : (match && match.cost !== "NA" ? parseInt(match.cost.replace(/,/g,"")) : null);

        const armorDamageAmount = mech.defaultTotalArmor - mech.totalArmorRemaining;
        const internalDamageAmount = mech.defaultTotalInternal - mech.totalInternalRemaining;
        const repairCost = (armorDamageAmount * 2000) + (internalDamageAmount * 5000);

        return (
        <div key={idx} className="border rounded-lg p-4 my-4 bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">{mech.name}</h2>
          <p><b>Mass:</b> {mech.mass} tons</p>
          <p><b>Pilot:</b> Gunnery {mech.pilot.gunnery}, Piloting {mech.pilot.piloting} ({mech.pilot.status})</p>

          {baseCost !== null ? (
            <p><b>Base Cost:</b> {baseCost.toLocaleString()}</p>
          ) : (
            <div>
              <p><b>Base Cost:</b> Unknown</p>
              <input
                type="number"
                placeholder="Enter Mech Cost"
                className="border p-1"
                onBlur={(e) => setCostOverride(mech.name, e.target.value)}
              />
            </div>
          )}

          <p><b>Repair Cost:</b> {repairCost.toLocaleString()}</p>
          <p><b>Armor Remaining:</b> {((mech.totalArmorRemaining / mech.defaultTotalArmor) * 100).toFixed(1)}%</p>
          <p><b>Internal Remaining:</b> {((mech.totalInternalRemaining / mech.defaultTotalInternal) * 100).toFixed(1)}%</p>

          <h3 className="mt-3 font-semibold">Limb Status</h3>
          <ul className="ml-4">
            {mech.limbStatus.map((l, i) => (
              <li key={i}>
                {l.loc}:{" "}
                {l.destroyed ? "💀 Destroyed" : l.damaged ? "⚠️ Damaged" : "✅ Intact"}{" "}
                (Armor {l.armorDamage}/{l.armorDefault}, Internal {l.internalRemaining}/{l.internalDefault})
              </li>
            ))}
          </ul>

          <h3 className="mt-3 font-semibold">Equipment by Location</h3>
          {mech.equipmentByLoc.map((e, i) => (
            <div key={i} className={`ml-4 mb-2 flech-${e.loc.toLowerCase().replace(/\s+/g, '-')}`}>
              <b>{e.loc}</b>{" "}
              {e.destroyed
                ? "💥 Destroyed"
                : e.damaged
                ? "⚠️ Damaged"
                : "✅ Intact"}
              {e.critHits && " ❗Critical Hit"}
              <ul className="ml-4 list-disc">
                {e.items.map((item, j) => (
                  <li key={j}>
                    {item.name} {item.destroyed && "💥"}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )})}
    </div>
  );
}
