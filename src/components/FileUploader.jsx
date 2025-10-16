import { useState } from "react";

export default function FileUploader({ onFileLoaded }) {
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      onFileLoaded(json);
    } catch (err) {
      setError("Invalid JSON file");
      console.error(err);
    }
  };

  return (
    <div className="file-uploader">
      <input type="file" accept=".json" onChange={handleFileChange} />
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
