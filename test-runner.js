// Direct geometric test for classifier algorithms
function distance(kp1, kp2) {
  const dx = kp1.x - kp2.x;
  const dy = kp1.y - kp2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getKeypointsMap(pose, minScore = 0.25) {
  const map = {};
  for (const kp of pose.keypoints) {
    if ((kp.score ?? 1) >= minScore && kp.name) {
      map[kp.name] = kp;
    }
  }
  return map;
}

function getShoulderWidth(kps) {
  if (kps.left_shoulder && kps.right_shoulder) {
    return Math.max(distance(kps.left_shoulder, kps.right_shoulder), 40);
  }
  return 100;
}

function evaluateDab(pose) {
  const kps = getKeypointsMap(pose);
  const sw = getShoulderWidth(kps);

  if (!kps.left_shoulder || !kps.right_shoulder || (!kps.left_wrist && !kps.right_wrist)) {
    return { isMatch: false, score: 0.1, feedback: 'Step back so upper body and arms are visible' };
  }

  let rightDabScore = 0;
  if (kps.right_wrist && kps.right_elbow && kps.left_wrist) {
    const armElevated = kps.right_wrist.y < kps.right_shoulder.y - 0.25 * sw;
    if (armElevated) rightDabScore += 0.4;
    const armExtended = distance(kps.right_wrist, kps.right_shoulder) > 0.85 * sw;
    if (armExtended) rightDabScore += 0.2;
    const tuckDistFace = kps.nose ? distance(kps.left_wrist, kps.nose) : 999;
    const tuckDistSh = distance(kps.left_wrist, kps.right_shoulder);
    const leftTucked = tuckDistFace < 1.1 * sw || tuckDistSh < 1.1 * sw;
    if (leftTucked) rightDabScore += 0.3;
    if (kps.nose && kps.left_elbow) {
      const headTuck = distance(kps.nose, kps.left_elbow) < 1.2 * sw;
      if (headTuck) rightDabScore += 0.1;
    } else {
      rightDabScore += 0.1;
    }
  }

  let leftDabScore = 0;
  if (kps.left_wrist && kps.left_elbow && kps.right_wrist) {
    const armElevated = kps.left_wrist.y < kps.left_shoulder.y - 0.25 * sw;
    if (armElevated) leftDabScore += 0.4;
    const armExtended = distance(kps.left_wrist, kps.left_shoulder) > 0.85 * sw;
    if (armExtended) leftDabScore += 0.2;
    const tuckDistFace = kps.nose ? distance(kps.right_wrist, kps.nose) : 999;
    const tuckDistSh = distance(kps.right_wrist, kps.left_shoulder);
    const rightTucked = tuckDistFace < 1.1 * sw || tuckDistSh < 1.1 * sw;
    if (rightTucked) leftDabScore += 0.3;
    if (kps.nose && kps.right_elbow) {
      const headTuck = distance(kps.nose, kps.right_elbow) < 1.2 * sw;
      if (headTuck) leftDabScore += 0.1;
    } else {
      leftDabScore += 0.1;
    }
  }

  const bestScore = Math.max(rightDabScore, leftDabScore);
  return { isMatch: bestScore >= 0.78, score: Math.min(bestScore, 1) };
}

function evaluateWhip(pose) {
  const kps = getKeypointsMap(pose);
  const sw = getShoulderWidth(kps);

  if (!kps.left_shoulder || !kps.right_shoulder) {
    return { isMatch: false, score: 0.1 };
  }

  let rightWhipScore = 0;
  if (kps.right_wrist && kps.right_elbow) {
    const wristHeightDiff = Math.abs(kps.right_wrist.y - kps.right_shoulder.y);
    if (wristHeightDiff < 0.65 * sw) rightWhipScore += 0.35;
    const extension = distance(kps.right_wrist, kps.right_shoulder);
    if (extension > 0.8 * sw) rightWhipScore += 0.35;
    if (kps.left_wrist) {
      const leftPulledBack = distance(kps.left_wrist, kps.left_shoulder) < 0.9 * sw || kps.left_wrist.y > kps.left_shoulder.y + 0.2 * sw;
      if (leftPulledBack) rightWhipScore += 0.3;
    } else {
      rightWhipScore += 0.25;
    }
  }

  let leftWhipScore = 0;
  if (kps.left_wrist && kps.left_elbow) {
    const wristHeightDiff = Math.abs(kps.left_wrist.y - kps.left_shoulder.y);
    if (wristHeightDiff < 0.65 * sw) leftWhipScore += 0.35;
    const extension = distance(kps.left_wrist, kps.left_shoulder);
    if (extension > 0.8 * sw) leftWhipScore += 0.35;
    if (kps.right_wrist) {
      const rightPulledBack = distance(kps.right_wrist, kps.right_shoulder) < 0.9 * sw || kps.right_wrist.y > kps.right_shoulder.y + 0.2 * sw;
      if (rightPulledBack) leftWhipScore += 0.3;
    } else {
      leftWhipScore += 0.25;
    }
  }

  const bestScore = Math.max(rightWhipScore, leftWhipScore);
  return { isMatch: bestScore >= 0.75, score: Math.min(bestScore, 1) };
}

function evaluateWoah(pose) {
  const kps = getKeypointsMap(pose);
  const sw = getShoulderWidth(kps);

  if (!kps.left_shoulder || !kps.right_shoulder || !kps.left_wrist || !kps.right_wrist || !kps.left_elbow || !kps.right_elbow) {
    return { isMatch: false, score: 0.1 };
  }

  let score = 0;
  const avgShoulderY = (kps.left_shoulder.y + kps.right_shoulder.y) / 2;
  const avgWristY = (kps.left_wrist.y + kps.right_wrist.y) / 2;
  const wristInChestBand = avgWristY > avgShoulderY + 0.05 * sw && avgWristY < avgShoulderY + 1.25 * sw;
  if (wristInChestBand) score += 0.35;

  const leftElbowFlared = Math.abs(kps.left_elbow.x - kps.left_shoulder.x) > 0.3 * sw || kps.left_elbow.x < kps.left_shoulder.x;
  const rightElbowFlared = Math.abs(kps.right_elbow.x - kps.right_shoulder.x) > 0.3 * sw || kps.right_elbow.x > kps.right_shoulder.x;
  if (leftElbowFlared && rightElbowFlared) score += 0.35;

  const wristDistance = distance(kps.left_wrist, kps.right_wrist);
  if (wristDistance < 1.1 * sw) score += 0.2;
  score += 0.1; // stillness bonus

  return { isMatch: score >= 0.75, score: Math.min(score, 1) };
}

// Synthetic Poses
const centerX = 320, centerY = 240, sw = 140;
const dabPose = {
  keypoints: [
    { name: 'nose', x: centerX - 15, y: centerY - 80, score: 0.95 },
    { name: 'left_shoulder', x: centerX - sw / 2, y: centerY - 50, score: 0.95 },
    { name: 'right_shoulder', x: centerX + sw / 2, y: centerY - 50, score: 0.95 },
    { name: 'right_elbow', x: centerX + sw / 2 + 65, y: centerY - 120, score: 0.95 },
    { name: 'right_wrist', x: centerX + sw / 2 + 130, y: centerY - 190, score: 0.98 },
    { name: 'left_elbow', x: centerX - 30, y: centerY - 30, score: 0.95 },
    { name: 'left_wrist', x: centerX - 10, y: centerY - 85, score: 0.98 },
  ]
};

const whipPose = {
  keypoints: [
    { name: 'nose', x: centerX, y: centerY - 100, score: 0.95 },
    { name: 'left_shoulder', x: centerX - sw / 2, y: centerY - 50, score: 0.95 },
    { name: 'right_shoulder', x: centerX + sw / 2, y: centerY - 50, score: 0.95 },
    { name: 'right_elbow', x: centerX + sw / 2 + 70, y: centerY - 50, score: 0.95 },
    { name: 'right_wrist', x: centerX + sw / 2 + 140, y: centerY - 48, score: 0.98 },
    { name: 'left_elbow', x: centerX - sw / 2 - 30, y: centerY - 20, score: 0.95 },
    { name: 'left_wrist', x: centerX - sw / 2 - 10, y: centerY + 10, score: 0.9 },
  ]
};

const woahPose = {
  keypoints: [
    { name: 'nose', x: centerX, y: centerY - 105, score: 0.95 },
    { name: 'left_shoulder', x: centerX - sw / 2, y: centerY - 50, score: 0.95 },
    { name: 'right_shoulder', x: centerX + sw / 2, y: centerY - 50, score: 0.95 },
    { name: 'left_elbow', x: centerX - sw / 2 - 60, y: centerY - 10, score: 0.95 },
    { name: 'right_elbow', x: centerX + sw / 2 + 60, y: centerY - 10, score: 0.95 },
    { name: 'left_wrist', x: centerX - 20, y: centerY - 10, score: 0.98 },
    { name: 'right_wrist', x: centerX + 20, y: centerY - 10, score: 0.98 },
  ]
};

console.log('1. Testing Dab Pose:', evaluateDab(dabPose));
if (!evaluateDab(dabPose).isMatch) throw new Error('Dab pose failed!');

console.log('2. Testing Whip Pose:', evaluateWhip(whipPose));
if (!evaluateWhip(whipPose).isMatch) throw new Error('Whip pose failed!');

console.log('3. Testing Woah Pose:', evaluateWoah(woahPose));
if (!evaluateWoah(woahPose).isMatch) throw new Error('Woah pose failed!');

console.log('4. Testing Cross Rejection (Dab as Woah):', evaluateWoah(dabPose));
if (evaluateWoah(dabPose).isMatch) throw new Error('Cross rejection failed!');

console.log('5. Testing Cross Rejection (Whip as Dab):', evaluateDab(whipPose));
if (evaluateDab(whipPose).isMatch) throw new Error('Cross rejection failed!');

console.log('✅ ALL GEOMETRIC CLASSIFICATION UNIT TESTS SUCCEEDED!');
