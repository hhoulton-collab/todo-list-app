# PM Notes

A product manager notes + to-do SPA built with React 18 + HTM (no build step required).

## Getting Started

### Serve the app

From the `notes-app` directory:

```bash
cd notes-app
python3 -m http.server 8080
```

Then open your browser at:

```
http://localhost:8080
```

## Tech Stack

- **React 18** via CDN (esm.sh)
- **HTM** — JSX-like tagged templates, no transpiler needed
- **Python 3** HTTP server for local development
- **localStorage** for persistence

## Project Structure

```
notes-app/
├── index.html              # Entry point, import map, bootstrap script
├── src/
│   ├── App.js              # Root component, state management
│   ├── store.js            # Reducer, actions, initial state
│   ├── utils/
│   │   └── storage.js      # localStorage helpers
│   └── styles/
│       ├── globals.css     # Design system, layout, components
│       └── animations.css  # Keyframe animations, utility classes
└── README.md
```
