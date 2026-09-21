import React from 'react';
import type { Pose } from '@tensorflow-models/pose-detection';
import { DanceMoveId } from '../types';

interface SimulatorControlsProps {
  currentMoveId: DanceMoveId;
  isSimulating: boolean;
  onToggleSimulation: (enable: boolean) => void;
  onInjectSimulatedPose: (pose: Pose) => void;
}

// Generates synthetic MoveNet keypoint coordinates matching each pose criteria
export function generateSyntheticPose(moveId: DanceMoveId, width = 640, height = 480): Pose {
  const centerX = width / 2;
  const centerY = height / 2;
  const sw = 140; // simulated shoulder width

  let keypoints: { name: string; x: number; y: number; score: number }[] = [];

  if (moveId === 'dab') {
    keypoints = [
      { name: 'nose', x: centerX - 15, y: centerY - 80, score: 0.95 },
      { name: 'left_eye', x: centerX - 25, y: centerY - 85, score: 0.9 },
      { name: 'right_eye', x: centerX, y: centerY - 85, score: 0.9 },
      { name: 'left_ear', x: centerX - 45, y: centerY - 80, score: 0.9 },
      { name: 'right_ear', x: centerX + 15, y: centerY - 80, score: 0.9 },
      { name: 'left_shoulder', x: centerX - sw / 2, y: centerY - 50, score: 0.95 },
      { name: 'right_shoulder', x: centerX + sw / 2, y: centerY - 50, score: 0.95 },
      { name: 'right_elbow', x: centerX + sw / 2 + 65, y: centerY - 120, score: 0.95 },
      { name: 'right_wrist', x: centerX + sw / 2 + 130, y: centerY - 190, score: 0.98 },
      { name: 'left_elbow', x: centerX - 30, y: centerY - 30, score: 0.95 },
      { name: 'left_wrist', x: centerX - 10, y: centerY - 85, score: 0.98 },
      { name: 'left_hip', x: centerX - 55, y: centerY + 90, score: 0.9 },
      { name: 'right_hip', x: centerX + 55, y: centerY + 90, score: 0.9 },
      { name: 'left_knee', x: centerX - 60, y: centerY + 180, score: 0.9 },
      { name: 'right_knee', x: centerX + 60, y: centerY + 180, score: 0.9 },
      { name: 'left_ankle', x: centerX - 65, y: centerY + 240, score: 0.9 },
      { name: 'right_ankle', x: centerX + 65, y: centerY + 240, score: 0.9 },
    ];
  } else if (moveId === 'whip') {
    keypoints = [
      { name: 'nose', x: centerX, y: centerY - 100, score: 0.95 },
      { name: 'left_eye', x: centerX - 20, y: centerY - 108, score: 0.9 },
      { name: 'right_eye', x: centerX + 20, y: centerY - 108, score: 0.9 },
      { name: 'left_ear', x: centerX - 45, y: centerY - 105, score: 0.9 },
      { name: 'right_ear', x: centerX + 45, y: centerY - 105, score: 0.9 },
      { name: 'left_shoulder', x: centerX - sw / 2, y: centerY - 50, score: 0.95 },
      { name: 'right_shoulder', x: centerX + sw / 2, y: centerY - 50, score: 0.95 },
      { name: 'right_elbow', x: centerX + sw / 2 + 70, y: centerY - 50, score: 0.95 },
      { name: 'right_wrist', x: centerX + sw / 2 + 140, y: centerY - 48, score: 0.98 },
      { name: 'left_elbow', x: centerX - sw / 2 - 30, y: centerY - 20, score: 0.95 },
      { name: 'left_wrist', x: centerX - sw / 2 - 10, y: centerY + 10, score: 0.9 },
      { name: 'left_hip', x: centerX - 65, y: centerY + 100, score: 0.9 },
      { name: 'right_hip', x: centerX + 65, y: centerY + 100, score: 0.9 },
      { name: 'left_knee', x: centerX - 90, y: centerY + 180, score: 0.9 },
      { name: 'right_knee', x: centerX + 90, y: centerY + 180, score: 0.9 },
      { name: 'left_ankle', x: centerX - 100, y: centerY + 240, score: 0.9 },
      { name: 'right_ankle', x: centerX + 100, y: centerY + 240, score: 0.9 },
    ];
  } else {
    keypoints = [
      { name: 'nose', x: centerX, y: centerY - 105, score: 0.95 },
      { name: 'left_eye', x: centerX - 20, y: centerY - 112, score: 0.9 },
      { name: 'right_eye', x: centerX + 20, y: centerY - 112, score: 0.9 },
      { name: 'left_ear', x: centerX - 45, y: centerY - 110, score: 0.9 },
      { name: 'right_ear', x: centerX + 45, y: centerY - 110, score: 0.9 },
      { name: 'left_shoulder', x: centerX - sw / 2, y: centerY - 50, score: 0.95 },
      { name: 'right_shoulder', x: centerX + sw / 2, y: centerY - 50, score: 0.95 },
      { name: 'left_elbow', x: centerX - sw / 2 - 60, y: centerY - 10, score: 0.95 },
      { name: 'right_elbow', x: centerX + sw / 2 + 60, y: centerY - 10, score: 0.95 },
      { name: 'left_wrist', x: centerX + sw / 2, y: centerY - 50, score: 0.98 },
      { name: 'right_wrist', x: centerX - 55, y: centerY + 90, score: 0.98 },
      { name: 'left_hip', x: centerX - 55, y: centerY + 90, score: 0.9 },
      { name: 'right_hip', x: centerX + 55, y: centerY + 90, score: 0.9 },
      { name: 'left_knee', x: centerX - 60, y: centerY + 180, score: 0.9 },
      { name: 'right_knee', x: centerX + 60, y: centerY + 180, score: 0.9 },
      { name: 'left_ankle', x: centerX - 65, y: centerY + 240, score: 0.9 },
      { name: 'right_ankle', x: centerX + 65, y: centerY + 240, score: 0.9 },
    ];
  }

  return {
    score: 0.96,
    keypoints: keypoints as any
  };
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  currentMoveId,
  isSimulating,
  onToggleSimulation,
}) => {
  return (
    <div className="w-full">
      <button
        onClick={() => onToggleSimulation(!isSimulating)}
        style={{ filter: 'url(#wiggle-general)' }}
        className={`wiggle-on-hover w-full py-1 px-4 border-2 border-black rounded-2xl text-[18pt] font-normal uppercase tracking-wider select-none cursor-pointer ${
          isSimulating
            ? 'bg-black text-white'
            : 'bg-white hover:bg-slate-100 text-black'
        }`}
      >
        {isSimulating ? `SIMULATING ${currentMoveId.toUpperCase()}...` : 'TEST / DEMO POSE'}
      </button>
    </div>
  );
};
