# 🚗 Three.js 3D Car Viewer

An interactive 3D car model viewer built with Three.js. This project demonstrates loading and manipulating 3D GLTF models in a web browser with keyboard controls, orbit camera, and fullscreen support.

![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

- **3D Model Loading** - Load and display GLTF/GLB 3D models
- **Orbit Controls** - Rotate, pan, and zoom around the model with mouse
- **Keyboard Controls** - Move and rotate the 3D model using keyboard
- **Auto-Rotation** - Smooth automatic rotation of the camera view
- **Fullscreen Mode** - Double-click to toggle fullscreen
- **Responsive Design** - Automatically adapts to window resizing
- **Damping Effect** - Smooth camera movement with damping

## 🎮 Controls

### Mouse Controls

| Action      | Control            |
| ----------- | ------------------ |
| Rotate view | Left-click + drag  |
| Pan view    | Right-click + drag |
| Zoom        | Mouse wheel        |

### Keyboard Controls

| Key          | Action                   |
| ------------ | ------------------------ |
| `W`          | Move model forward (Z+)  |
| `S`          | Move model backward (Z-) |
| `A`          | Move model left (X+)     |
| `D`          | Move model right (X-)    |
| `Q`          | Rotate model left        |
| `E`          | Rotate model right       |
| `Z`          | Move model down (Y-)     |
| `X`          | Move model up (Y+)       |
| `Arrow Keys` | Pan camera               |

### Other

- **Double-click** - Toggle fullscreen mode

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd threejs
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## 📦 Build

To build the project for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## 🐳 Docker

### Pull from Docker Hub

The image is available on Docker Hub:

```bash
docker pull omid2831/omid-threejs-app
docker run -p 3000:3000 omid2831/omid-threejs-app
```

🔗 **Docker Hub:** [omid2831/omid-threejs-app](https://hub.docker.com/r/omid2831/omid-threejs-app)

### Build Locally

Or build and run locally with Docker:

```bash
# Build the image
docker build -t threejs-viewer .

# Run the container
docker run -p 3000:3000 threejs-viewer
```

Then open `http://localhost:3000` in your browser.

## 📁 Project Structure

```
threejs/
├── public/
│   └── models/
│       └── car.glb        # 3D car model
├── index.html             # HTML entry point
├── main.js                # Main Three.js application
├── package.json           # Project dependencies
├── Dockerfile             # Docker configuration
└── README.md              # This file
```

## 🛠️ Technologies Used

- **[Three.js](https://threejs.org/)** - 3D graphics library
- **[Vite](https://vitejs.dev/)** - Fast build tool and dev server
- **[GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)** - For loading 3D models
- **[OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls)** - Camera control system

## 📄 License

ISC

---

Made with ❤️ and Three.js
