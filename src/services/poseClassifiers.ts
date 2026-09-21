import type { Keypoint, Pose } from '@tensorflow-models/pose-detection';
import { DanceMoveId, PoseEvaluationResult } from '../types';

export interface KeypointMap {
  nose?: Keypoint;
  left_eye?: Keypoint;
  right_eye?: Keypoint;
  left_ear?: Keypoint;
  right_ear?: Keypoint;
  left_shoulder?: Keypoint;
  right_shoulder?: Keypoint;
  left_elbow?: Keypoint;
  right_elbow?: Keypoint;
  left_wrist?: Keypoint;
  right_wrist?: Keypoint;
  left_hip?: Keypoint;
  right_hip?: Keypoint;
  left_knee?: Keypoint;
  right_knee?: Keypoint;
  left_ankle?: Keypoint;
  right_ankle?: Keypoint;
}

export function getKeypointsMap(pose: Pose, minScore: number = 0.25): KeypointMap {
  const map: KeypointMap = {};
  for (const kp of pose.keypoints) {
    if ((kp.score ?? 1) >= minScore && kp.name) {
      map[kp.name as keyof KeypointMap] = kp;
    }
  }
  return map;
}

export function distance(kp1: Keypoint, kp2: Keypoint): number {
  const dx = kp1.x - kp2.x;
  const dy = kp1.y - kp2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getShoulderWidth(kps: KeypointMap): number {
  if (kps.left_shoulder && kps.right_shoulder) {
    return Math.max(distance(kps.left_shoulder, kps.right_shoulder), 40);
  }
  return 100; // fallback reference scale
}

/**
 * Classify "The Dab"
 * - Primary arm extended diagonally high
 * - Secondary wrist tucked near head/opposite shoulder
 * - Head tucked toward crook
 */
export function evaluateDab(pose: Pose): PoseEvaluationResult {
  const kps = getKeypointsMap(pose);
  const sw = getShoulderWidth(kps);

  if (!kps.left_shoulder || !kps.right_shoulder || (!kps.left_wrist && !kps.right_wrist)) {
    return {
      isMatch: false,
      score: 0.1,
      feedback: 'Step back so upper body and arms are visible'
    };
  }

  // Check Right Dab (right arm high, left wrist tucked)
  let rightDabScore = 0;
  let rightDabHints: string[] = [];

  if (kps.right_wrist && kps.right_elbow && kps.left_wrist) {
    // 1. Right wrist significantly higher than right shoulder
    const armElevated = kps.right_wrist.y < kps.right_shoulder.y - 0.25 * sw;
    if (armElevated) rightDabScore += 0.4;
    else rightDabHints.push('Raise right arm higher diagonally');

    // 2. Right arm extended out
    const armExtended = distance(kps.right_wrist, kps.right_shoulder) > 0.85 * sw;
    if (armExtended) rightDabScore += 0.2;
    else rightDabHints.push('Extend right arm straight out');

    // 3. Left wrist tucked to face / right shoulder
    const tuckDistFace = kps.nose ? distance(kps.left_wrist, kps.nose) : 999;
    const tuckDistSh = distance(kps.left_wrist, kps.right_shoulder);
    const leftTucked = tuckDistFace < 1.1 * sw || tuckDistSh < 1.1 * sw;
    if (leftTucked) rightDabScore += 0.3;
    else rightDabHints.push('Tuck left wrist close to your face');

    // 4. Head tilt / tuck
    if (kps.nose && kps.left_elbow) {
      const headTuck = distance(kps.nose, kps.left_elbow) < 1.2 * sw;
      if (headTuck) rightDabScore += 0.1;
    } else {
      rightDabScore += 0.1;
    }
  }

  // Check Left Dab (left arm high, right wrist tucked)
  let leftDabScore = 0;
  let leftDabHints: string[] = [];

  if (kps.left_wrist && kps.left_elbow && kps.right_wrist) {
    // 1. Left wrist higher than left shoulder
    const armElevated = kps.left_wrist.y < kps.left_shoulder.y - 0.25 * sw;
    if (armElevated) leftDabScore += 0.4;
    else leftDabHints.push('Raise left arm higher diagonally');

    // 2. Left arm extended out
    const armExtended = distance(kps.left_wrist, kps.left_shoulder) > 0.85 * sw;
    if (armExtended) leftDabScore += 0.2;
    else leftDabHints.push('Extend left arm straight out');

    // 3. Right wrist tucked
    const tuckDistFace = kps.nose ? distance(kps.right_wrist, kps.nose) : 999;
    const tuckDistSh = distance(kps.right_wrist, kps.left_shoulder);
    const rightTucked = tuckDistFace < 1.1 * sw || tuckDistSh < 1.1 * sw;
    if (rightTucked) leftDabScore += 0.3;
    else leftDabHints.push('Tuck right wrist close to your face');

    // 4. Head tilt
    if (kps.nose && kps.right_elbow) {
      const headTuck = distance(kps.nose, kps.right_elbow) < 1.2 * sw;
      if (headTuck) leftDabScore += 0.1;
    } else {
      leftDabScore += 0.1;
    }
  }

  const bestScore = Math.max(rightDabScore, leftDabScore);
  const isMatch = bestScore >= 0.78;

  let feedback = 'Hold the Dab!';
  if (!isMatch) {
    feedback = (rightDabScore >= leftDabScore ? rightDabHints[0] : leftDabHints[0]) || 'Raise one arm diagonally & tuck opposite wrist';
  }

  return {
    isMatch,
    score: Math.min(bestScore, 1),
    feedback
  };
}

/**
 * Classify "The Whip"
 * - One arm pushed forward/out at shoulder height
 * - Opposite arm pulled back / bent
 * - Drop in torso or stance
 */
export function evaluateWhip(pose: Pose): PoseEvaluationResult {
  const kps = getKeypointsMap(pose);
  const sw = getShoulderWidth(kps);

  if (!kps.left_shoulder || !kps.right_shoulder) {
    return {
      isMatch: false,
      score: 0.1,
      feedback: 'Center your shoulders in frame'
    };
  }

  // Right Whip: Right hand extended forward near shoulder level, Left hand tucked/back
  let rightWhipScore = 0;
  let rightWhipHints: string[] = [];

  if (kps.right_wrist && kps.right_elbow) {
    // 1. Right wrist at shoulder height (within range)
    const wristHeightDiff = Math.abs(kps.right_wrist.y - kps.right_shoulder.y);
    if (wristHeightDiff < 0.65 * sw) {
      rightWhipScore += 0.35;
    } else {
      rightWhipHints.push('Level right arm with shoulder');
    }

    // 2. Right arm pushed out / extended
    const extension = distance(kps.right_wrist, kps.right_shoulder);
    if (extension > 0.8 * sw) {
      rightWhipScore += 0.35;
    } else {
      rightWhipHints.push('Punch right arm out firmly');
    }

    // 3. Opposite arm pulled back / lower or bent
    if (kps.left_wrist) {
      const leftPulledBack = distance(kps.left_wrist, kps.left_shoulder) < 0.9 * sw || kps.left_wrist.y > kps.left_shoulder.y + 0.2 * sw;
      if (leftPulledBack) rightWhipScore += 0.3;
      else rightWhipHints.push('Pull left arm back');
    } else {
      rightWhipScore += 0.25; // if obscured by body, it's pulled back
    }
  }

  // Left Whip: Left hand extended forward, Right hand pulled back
  let leftWhipScore = 0;
  let leftWhipHints: string[] = [];

  if (kps.left_wrist && kps.left_elbow) {
    const wristHeightDiff = Math.abs(kps.left_wrist.y - kps.left_shoulder.y);
    if (wristHeightDiff < 0.65 * sw) {
      leftWhipScore += 0.35;
    } else {
      leftWhipHints.push('Level left arm with shoulder');
    }

    const extension = distance(kps.left_wrist, kps.left_shoulder);
    if (extension > 0.8 * sw) {
      leftWhipScore += 0.35;
    } else {
      leftWhipHints.push('Punch left arm out firmly');
    }

    if (kps.right_wrist) {
      const rightPulledBack = distance(kps.right_wrist, kps.right_shoulder) < 0.9 * sw || kps.right_wrist.y > kps.right_shoulder.y + 0.2 * sw;
      if (rightPulledBack) leftWhipScore += 0.3;
      else leftWhipHints.push('Pull right arm back');
    } else {
      leftWhipScore += 0.25;
    }
  }

  const bestScore = Math.max(rightWhipScore, leftWhipScore);
  const isMatch = bestScore >= 0.75;

  let feedback = 'Whip locked in! Hold it!';
  if (!isMatch) {
    feedback = (rightWhipScore >= leftWhipScore ? rightWhipHints[0] : leftWhipHints[0]) || 'Punch one arm forward at shoulder height';
  }

  return {
    isMatch,
    score: Math.min(bestScore, 1),
    feedback
  };
}

/**
 * Classify "The Woah": one hand crosses to the opposite shoulder,
 * while the other crosses to the opposite hip.
 */
export function evaluateWoah(pose: Pose): PoseEvaluationResult {
  const kps = getKeypointsMap(pose);
  const sw = getShoulderWidth(kps);

  if (!kps.left_shoulder || !kps.right_shoulder || !kps.left_hip || !kps.right_hip || !kps.left_wrist || !kps.right_wrist) {
    return {
      isMatch: false,
      score: 0.1,
      feedback: 'Step back so both hands and hips are visible'
    };
  }

  const leftAtShoulder = distance(kps.left_wrist, kps.right_shoulder) < 0.7 * sw;
  const rightAtShoulder = distance(kps.right_wrist, kps.left_shoulder) < 0.7 * sw;
  const leftAtHip = distance(kps.left_wrist, kps.right_hip) < 0.8 * sw;
  const rightAtHip = distance(kps.right_wrist, kps.left_hip) < 0.8 * sw;
  const isMatch = (leftAtShoulder && rightAtHip) || (rightAtShoulder && leftAtHip);
  const score = Math.max((leftAtShoulder ? 0.5 : 0) + (rightAtHip ? 0.5 : 0), (rightAtShoulder ? 0.5 : 0) + (leftAtHip ? 0.5 : 0));
  const feedback = isMatch ? 'Hold the Woah!' : leftAtShoulder || rightAtShoulder ? 'Bring the other fist to the opposite hip' : 'Bring one fist to the opposite shoulder';

  return {
    isMatch,
    score,
    feedback
  };
}

/**
 * Dispatcher to evaluate any move
 */
export function evaluatePoseForMove(moveId: DanceMoveId, pose: Pose): PoseEvaluationResult {
  switch (moveId) {
    case 'dab':
      return evaluateDab(pose);
    case 'whip':
      return evaluateWhip(pose);
    case 'woah':
      return evaluateWoah(pose);
    default:
      return { isMatch: false, score: 0, feedback: 'Unknown move' };
  }
}
