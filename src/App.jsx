import { useState } from "react";
import FileUploader from "./components/FileUploader";
import { parseFlechsExport } from "./utils/parseFlechs";
import { 
  calculateMechRepairCosts, 
  formatCBills, 
  calculateRepairPercentage,
  analyzeSalvageValue 
} from "./utils/calculateRepairCosts";
import mechList from './mech-list.json';

export default function App() {
  const [mechs, setMechs] = useState([]);
  const [manualCosts, setManualCosts] = useState({});
  const [showDetailedCosts, setShowDetailedCosts] = useState({});

  const handleFile = (json) => setMechs(parseFlechsExport(json));
  
  const toggleDetailedCosts = (mechName) => {
    setShowDetailedCosts(prev => ({ ...prev, [mechName]: !prev[mechName] }));
  };

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

        // Get detailed repair costs using new calculation system
        const detailedCosts = calculateMechRepairCosts(mech, mech.srcMTF || "");
        const repairCost = detailedCosts.grandTotal;
        const salvageAnalysis = analyzeSalvageValue(repairCost, baseCost);

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

          <div className="my-3 p-3 bg-blue-50 rounded">
            <p className="text-lg"><b>Total Repair Cost:</b> {formatCBills(repairCost)}</p>
            {baseCost && (
              <p className="text-sm text-gray-600">
                {calculateRepairPercentage(repairCost, baseCost)} of base cost
              </p>
            )}
            
            {salvageAnalysis.salvageable !== null && (
              <p className={`text-sm font-semibold mt-1 ${
                salvageAnalysis.rating === 'excellent' ? 'text-green-600' :
                salvageAnalysis.rating === 'good' ? 'text-blue-600' :
                salvageAnalysis.rating === 'marginal' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {salvageAnalysis.recommendation}
              </p>
            )}
            
            <button
              onClick={() => toggleDetailedCosts(mech.name)}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              {showDetailedCosts[mech.name] ? "Hide" : "Show"} Cost Breakdown
            </button>
          </div>

          {showDetailedCosts[mech.name] && (
            <div className="my-3 p-3 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">Cost Breakdown</h3>
              
              <div className="mb-2">
                <p><b>Armor Repair:</b> {formatCBills(detailedCosts.totalArmorCost)}</p>
                <p className="text-sm text-gray-600 ml-4">
                  {mech.armorDamageAmount} points @ 625 C-Bills/point
                </p>
              </div>
              
              <div className="mb-2">
                <p><b>Internal Structure Repair:</b> {formatCBills(detailedCosts.totalInternalCost)}</p>
                <p className="text-sm text-gray-600 ml-4">
                  {mech.internalDamageAmount} points @ 250 C-Bills/point
                </p>
              </div>
              
              <div className="mb-2">
                <p><b>Component Repairs:</b> {formatCBills(detailedCosts.totalComponentCost)}</p>
                {detailedCosts.components.map((loc, i) => (
                  <div key={i} className="ml-4 mt-2 text-sm">
                    <p className="font-semibold">{loc.location}: {formatCBills(loc.totalCost)}</p>
                    <ul className="ml-4 list-disc">
                      {loc.items.map((item, j) => (
                        <li key={j} className={item.destroyed ? "text-red-600" : "text-yellow-600"}>
                          {item.name}: {formatCBills(item.cost)} {item.destroyed ? "(destroyed)" : "(damaged)"}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

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
