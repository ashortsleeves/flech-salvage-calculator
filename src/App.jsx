import { useState } from "react";
import FileUploader from "./components/FileUploader";
import { parseFlechsExport } from "./utils/parseFlechs";
// import { mechList } from './mech-list.json';

export default function App() {
  const [mechs, setMechs] = useState([]);

  const handleFile = (json) => setMechs(parseFlechsExport(json));

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">Flechs Salvage Calculator</h1>
      <FileUploader onFileLoaded={handleFile} />

      {mechs.map((mech, idx) => (
        <div key={idx} className="border rounded-lg p-4 my-4 bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">{mech.name}</h2>
          <p><b>Mass:</b> {mech.mass} tons</p>
          <p><b>Pilot:</b> Gunnery {mech.pilot.gunnery}, Piloting {mech.pilot.piloting} ({mech.pilot.status})</p>
          <p><b>Total Armor Damage:</b> {mech.armorDamage}</p>
          <p><b>Total Internal Damage:</b> {mech.internalDamage}</p>

          <h3 className="mt-3 font-semibold">Limb Status</h3>
          <ul className="ml-4">
            {mech.limbStatus.map((l, i) => (
              <li key={i}>
                {l.loc}:{" "}
                {l.destroyed ? "💀 Destroyed" : l.damaged ? "⚠️ Damaged" : "✅ Intact"}{" "}
                (Armor {l.armorDamage}/{l.armorDefault}, Internal {l.internalDamage})
              </li>
            ))}
          </ul>

          <h3 className="mt-3 font-semibold">Equipment by Location</h3>
          {mech.equipmentByLoc.map((e, i) => (
            <div key={i} className="ml-4 mb-2">
              <b>{e.loc}</b>{" "}
              {e.destroyed
                ? "💥 Destroyed"
                : e.damaged
                ? "⚠️ Damaged"
                : "✅ Intact"}
              {e.critHits && " ❗Critical Hit"}
              <ul className="ml-4 list-disc">
                {e.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
