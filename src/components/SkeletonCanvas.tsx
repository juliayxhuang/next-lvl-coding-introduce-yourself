import React, { useEffect, useRef } from 'react';
import type { Pose, Keypoint } from '@tensorflow-models/pose-detection';

interface SkeletonCanvasProps {
  pose: Pose | null;
  width: number;
  height: number;
  isMatch: boolean;
  score: number;
  mirrored?: boolean;
}

// MoveNet Thunder adjacency graph
const POSE_CONNECTIONS: [string, string][] = [
  ['nose', 'left_eye'],
  ['nose', 'right_eye'],
  ['left_eye', 'left_ear'],
  ['right_eye', 'right_ear'],
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
];

export const SkeletonCanvas: React.FC<SkeletonCanvasProps> = ({
  pose,
  width,
  height,
  isMatch,
  score,
  mirrored = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous frame
    ctx.clearRect(0, 0, width, height);

    if (!pose || !pose.keypoints || pose.keypoints.length === 0) {
      return;
    }

    ctx.save();

    // Map keypoints for quick lookup
    const kpMap = new Map<string, Keypoint>();
    pose.keypoints.forEach((kp) => {
      if ((kp.score ?? 1) >= 0.25 && kp.name) {
        // Adjust for mirrored video coordinates if needed
        const adjustedX = mirrored ? width - kp.x : kp.x;
        kpMap.set(kp.name, { ...kp, x: adjustedX });
      }
    });

    // Determine glow and stroke colors based on match status
    const primaryColor = isMatch
      ? '#10b981' // emerald-500
      : score > 0.5
      ? '#38bdf8' // sky-400
      : '#818cf8'; // indigo-400

    const glowColor = isMatch
      ? 'rgba(16, 185, 129, 0.6)'
      : score > 0.5
      ? 'rgba(56, 189, 248, 0.4)'
      : 'rgba(129, 140, 248, 0.3)';

    // 1. Draw Skeleton Bones / Connections
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = isMatch ? 16 : 8;
    ctx.shadowColor = glowColor;
    ctx.strokeStyle = primaryColor;

    for (const [partA, partB] of POSE_CONNECTIONS) {
      const kpA = kpMap.get(partA);
      const kpB = kpMap.get(partB);
      if (kpA && kpB) {
        ctx.beginPath();
        ctx.moveTo(kpA.x, kpA.y);
        ctx.lineTo(kpB.x, kpB.y);
        ctx.stroke();
      }
    }

    // 2. Draw Keypoint Joints / Nodes
    kpMap.forEach((kp, name) => {
      const isImportantJoint = ['left_wrist', 'right_wrist', 'left_elbow', 'right_elbow', 'nose'].includes(name);
      const radius = isImportantJoint ? 6.5 : 4.5;

      // Outer ring
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = isMatch ? 12 : 6;
      ctx.shadowColor = glowColor;
      ctx.fill();

      // Inner accent dot
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, radius - 2, 0, 2 * Math.PI);
      ctx.fillStyle = primaryColor;
      ctx.fill();
    });

    ctx.restore();
  }, [pose, width, height, isMatch, score, mirrored]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none w-full h-full object-cover z-10"
    />
  );
};
