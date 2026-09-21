# 🕺 Dance To Unlock: Interactive "About Me" Portfolio

An experimental, interactive personal introduction website built with **React**, **Tailwind CSS**, **TensorFlow.js**, and **MoveNet (Thunder)** for real-time computer vision pose estimation.

Visitors select iconic dance moves, perform them in front of their webcam, hold the pose for 2 seconds, and unlock secret fun facts, tech obsessions, and personal lore.

---

## 🌟 Key Features

1. **Modern Minimalist & Playful UI**:
   - Built with high-end typography (`Syne` display font and `Plus Jakarta Sans`), glassmorphism card surfaces, and subtle ambient glows.
   - Clean progress counter, sound effects toggle, and full Fact Vault collection drawer.

2. **TensorFlow.js MoveNet Thunder Engine**:
   - Accelerated via the `@tensorflow/tfjs-backend-webgl` backend for smooth 30+ FPS tracking directly inside the browser.
   - Zero server latency — all image processing and pose inference happens locally on the client.

3. **Geometric Dance Move Classifiers (3 Iconic Moves)**:
   - **The Dab**: Detects high diagonal extension of one arm (~45° up and out), tucking of the opposite wrist across the face/eyes, and head tilt into the elbow crook (supports both Left and Right Dab).
   - **The Whip**: Detects forward punch arm at shoulder height with straight extension, opposite arm pulled back behind torso, and lowered hip stance (supports both Left and Right Whip).
   - **The Woah**: Detects chest-height wrist elevation, wide flared horizontal elbows, centralized hands, and stillness stability.

4. **Hold-Timer & Anti-False Positive**:
   - Radial SVG progress ring requiring the user to hold the detected pose continuously for 2.0 seconds with smooth feedback ticks.

5. **Dynamic Fact Reward & Replay System**:
   - Bank of fun facts categorized across Origin Stories, Tech Stack, Secret Superpowers, Hobbies, Hot Takes, and Soundtracks.
   - Prioritizes unread facts and allows infinite replay.
   - Fact Vault slide-over drawer to review all unlocked secrets anytime.

6. **Webcam Safety & Demo Mode**:
   - Clean lifecycle handling: webcam stream tracks and `requestAnimationFrame` loops are cleanly terminated on view transitions.
   - Built-in **Demo/Simulator Mode** allowing anyone to test and experience the dance recognition even without a webcam.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24)
- NPM 9+

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run unit tests for pose classifiers
npm test
```

---

## 📁 Project Architecture

```
├── src/
│   ├── components/
│   │   ├── Header.tsx              # Brand, progress stats, audio toggle, vault button
│   │   ├── MoveCard.tsx            # Dance selection card with custom SVG stickman
│   │   ├── PoseDetectorView.tsx    # Core camera stage, MoveNet loop, feedback banner
│   │   ├── SkeletonCanvas.tsx      # Neon skeleton joint & bone overlay
│   │   ├── HoldTimerRing.tsx       # 2.0-second radial hold meter
│   │   ├── RewardModal.tsx         # Confetti-powered fun fact reveal card
│   │   ├── FactsDrawer.tsx         # Slide-over collection vault for all 9 secrets
│   │   └── SimulatorControls.tsx   # Demo/test pose injector for testing
│   ├── data/
│   │   ├── moves.ts                # Dance moves metadata & instructions
│   │   └── facts.ts                # Fun facts bank categorized by move
│   ├── services/
│   │   ├── poseDetection.ts        # Singleton TFJS WebGL MoveNet Thunder loader
│   │   ├── poseClassifiers.ts      # Pure geometric angle & distance rule evaluators
│   │   └── audioEffects.ts         # Web Audio API procedural sound synthesizer
│   ├── utils/
│   │   └── confetti.ts             # Celebratory canvas-confetti bursts
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── App.tsx                     # Main view router & state management
│   ├── main.tsx                    # React DOM root entry
│   └── index.css                   # Tailwind styles & custom scrollbars
├── test-runner.js                  # Automated geometric test suite
└── package.json
```

---

## 📐 How Pose Geometry Works

Coordinates from MoveNet are normalized against the user's measured **Shoulder Width** (`distance(left_shoulder, right_shoulder)`), making detection robust regardless of how close or far the user stands from the camera:

$$ \text{Scale Factor} = \sqrt{(x_{\text{left\_shoulder}} - x_{\text{right\_shoulder}})^2 + (y_{\text{left\_shoulder}} - y_{\text{right\_shoulder}})^2} $$

- **Diagonal Elevation**: Tested by comparing wrist vertical coordinates against shoulder heights relative to the scale factor.
- **Tucked Wrists**: Measured by Euclidean distance between wrist and nose / opposite shoulder keypoints.
- **Chest Band**: Tested by bounding wrists between shoulder line and hip line with lateral elbow flaring.
