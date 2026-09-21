import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

let detectorInstance: poseDetection.PoseDetector | null = null;
let initPromise: Promise<poseDetection.PoseDetector> | null = null;

/**
 * Initialize TensorFlow.js WebGL backend and MoveNet Thunder Pose Detector
 */
export async function getPoseDetector(): Promise<poseDetection.PoseDetector> {
  if (detectorInstance) {
    return detectorInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      // Ensure WebGL backend is ready
      await tf.setBackend('webgl');
      await tf.ready();

      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
          enableSmoothing: true,
          minPoseScore: 0.25
        }
      );

      detectorInstance = detector;
      return detector;
    } catch (error) {
      console.error('Failed to initialize MoveNet detector:', error);
      // Fallback to Lightning if Thunder has WebGL resource constraint
      try {
        console.warn('Attempting fallback to MoveNet Lightning...');
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true
          }
        );
        detectorInstance = detector;
        return detector;
      } catch (fallbackErr) {
        console.error('MoveNet fallback failed:', fallbackErr);
        throw fallbackErr;
      }
    }
  })();

  return initPromise;
}

/**
 * Estimate pose from an HTMLVideoElement or canvas
 */
export async function estimatePoseFromVideo(
  detector: poseDetection.PoseDetector,
  videoElement: HTMLVideoElement
): Promise<poseDetection.Pose | null> {
  if (!videoElement || videoElement.readyState < 2) {
    return null;
  }

  try {
    const poses = await detector.estimatePoses(videoElement, {
      maxPoses: 1,
      flipHorizontal: false // We handle canvas mirroring visually
    });

    return poses && poses.length > 0 ? poses[0] : null;
  } catch (err) {
    // If WebGL context is temporarily lost or busy, catch gracefully
    console.warn('Pose estimation frame dropped:', err);
    return null;
  }
}

/**
 * Dispose detector instance on app teardown if needed
 */
export function disposePoseDetector(): void {
  if (detectorInstance) {
    detectorInstance.dispose();
    detectorInstance = null;
    initPromise = null;
  }
}
