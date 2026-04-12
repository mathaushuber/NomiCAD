# NomiCAD

A parametric 3D modeling library for personalized tags and keychains, built with TypeScript, Vite, Three.js, and @jscad/modeling.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Parameters

| Parameter     | Type                                | Default       | Description                        |
|---------------|-------------------------------------|---------------|------------------------------------|
| `shape`       | `"rectangle" \| "oval"`            | `"rectangle"` | Base shape                         |
| `width`       | `number` (mm)                       | `60`          | Shape width                        |
| `height`      | `number` (mm)                       | `30`          | Shape height                       |
| `thickness`   | `number` (mm)                       | `3`           | Shape thickness                    |
| `isKeychain`  | `boolean`                           | `true`        | Whether to add a keyring hole      |
| `holeDiameter`| `number` (mm)                       | `5`           | Keyring hole diameter              |
| `text`        | `string`                            | `"NomiCAD"`   | Text to emboss / engrave / cut     |
| `textMode`    | `"positive" \| "negative" \| "cutout"` | `"negative"` | How the text is applied           |

## Architecture

```
src/
├── main.ts                  # Bootstrap only
├── app/
│   ├── viewer/              # Three.js rendering layer
│   ├── ui/                  # State + DOM controls
│   └── export/              # STL export
├── core/
│   ├── parameters/          # Typed param interfaces
│   ├── builders/            # JSCAD geometry builders
│   ├── text/                # Text mode implementations
│   └── model/               # Model orchestration + validation
└── library/                 # Public API for library consumers
```

## Using as a Library

```typescript
import { buildModel, PRESETS } from './src/library'

const geometry = buildModel({
  ...PRESETS.keychainTag,
  text: 'Hello',
  textMode: 'negative',
})
```

## Export

Click **Export STL** in the sidebar to download the current model as an ASCII STL file.

## Tech Stack

- **TypeScript** — strong typing throughout
- **Vite** — development server and bundler
- **Three.js** — 3D viewport rendering
- **@jscad/modeling** — CSG geometry engine
- **@jscad/stl-serializer** — STL file export
