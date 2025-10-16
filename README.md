# Flechs Salvage Calculator

A BattleTech salvage assessment tool that parses and displays post-battle mech damage data from Flechs sheet exports.

![BattleTech](https://img.shields.io/badge/BattleTech-Salvage%20Tool-red)
![React](https://img.shields.io/badge/React-19.1-blue)
![Vite](https://img.shields.io/badge/Vite-7.1-646CFF)

## Overview

The Flechs Salvage Calculator is a web application designed for BattleTech players to quickly assess battle damage and salvage potential after combat scenarios. Upload a JSON export from Flechs sheets, and instantly see detailed damage reports for all mechs in your lance or enemy forces.

## Features

- 📁 **JSON File Upload** - Import Flechs sheet exports with a simple file upload
- 🤖 **Mech Status Display** - View comprehensive mech information including:
  - Designation and tonnage
  - Pilot statistics (gunnery, piloting, wound status)
  - Total armor and internal structure damage
- 🔧 **Limb & Equipment Tracking** - Visual status indicators for:
  - ✅ Intact components
  - ⚠️ Damaged sections (armor damage only)
  - 💀 Destroyed locations (internal structure damage)
  - ❗ Critical hit indicators
- 📋 **Equipment Inventory** - Detailed listing of all weapons and equipment organized by location
- 🎨 **Clean UI** - Modern, responsive interface with Tailwind CSS styling

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd flech-salvage-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## Usage

1. **Export Data from Flechs**: Generate a JSON export file from your Flechs sheet system
2. **Upload File**: Click the file input and select your `.json` export
3. **Review Damage**: The app will display detailed damage reports for each mech:
   - Overall damage summary
   - Limb-by-limb status breakdown
   - Equipment condition by location
   - Critical hit warnings

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code quality checks

## Project Structure

```
flech-salvage-calculator/
├── src/
│   ├── components/
│   │   └── FileUploader.jsx    # File upload component
│   ├── utils/
│   │   └── parseFlechs.js      # JSON parsing logic
│   ├── App.jsx                 # Main application component
│   ├── App.css                 # Application styles
│   ├── index.css               # Global styles
│   └── main.jsx                # Application entry point
├── public/                     # Static assets
├── index.html                  # HTML template
├── vite.config.js             # Vite configuration
└── package.json               # Project dependencies
```

## Technology Stack

- **React 19.1** - UI framework with modern hooks
- **Vite 7.1** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code quality and consistency

## Data Format

The app expects JSON exports from Flechs sheets with the following structure:

```json
{
  "sheets": [
    {
      "designation": "Atlas AS7-D",
      "meta": {
        "mass": 100,
        "srcMTF": "..."
      },
      "pilot": {
        "gunnery": 4,
        "piloting": 5,
        "wounds": ["ok", "ok", "ok", "ok", "ok", "ok"]
      },
      "armor": { /* location damage data */ },
      "internal": { /* internal structure data */ },
      "crits": { /* critical hit data */ }
    }
  ]
}
```

## Future Enhancements

Potential features for future development:

- [ ] Export damage reports to PDF
- [ ] Salvage value calculations based on equipment condition
- [ ] Multi-battle campaign tracking
- [ ] Repair cost estimates
- [ ] Compare before/after battle states
- [ ] Support for additional unit types (vehicles, aerospace)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built for the BattleTech community
- Designed to work with Flechs sheet exports
- Inspired by the need for quick post-battle damage assessment

---

**Note**: This is a fan-made tool for BattleTech gameplay and is not affiliated with Catalyst Game Labs or the official BattleTech franchise.
