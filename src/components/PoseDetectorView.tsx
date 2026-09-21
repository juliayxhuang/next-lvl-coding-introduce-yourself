import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DanceMove, PoseEvaluationResult } from '../types';
import { getPoseDetector, estimatePoseFromVideo } from '../services/poseDetection';
import { evaluatePoseForMove } from '../services/poseClassifiers';
import { SkeletonCanvas } from './SkeletonCanvas';
import { HoldTimerRing } from './HoldTimerRing';
import { SimulatorControls, generateSyntheticPose } from './SimulatorControls';
import { playHoldTick } from '../services/audioEffects';
import { WiggleBox } from './WiggleBox';
import { CameraOff, RefreshCw } from 'lucide-react';
import type { Pose } from '@tensorflow-models/pose-detection';

interface PoseDetectorViewProps {
  move: DanceMove;
  onBack: () => void;
  onMoveSuccess: (move: DanceMove) => void;
}

const HOLD_DURATION_MS = 1300;

export const PoseDetectorView: React.FC<PoseDetectorViewProps> = ({
  move,
  onBack: _onBack,
  onMoveSuccess,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Detector & video state
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({
    width: 640,
    height: 480,
  });

  // Tracking state
  const [currentPose, setCurrentPose] = useState<Pose | null>(null);
  const [evaluation, setEvaluation] = useState<PoseEvaluationResult>({
    isMatch: false,
    score: 0,
    feedback: 'POSITION YOURSELF IN FRONT OF CAMERA',
  });

  // Hold Timer state
  const holdStartTimeRef = useRef<number | null>(null);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [remainingSec, setRemainingSec] = useState<number>(HOLD_DURATION_MS / 1000);
  const isCompletedRef = useRef<boolean>(false);
  const lastTickSoundTime = useRef<number>(0);

  // Simulation mode
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const isSimulatingRef = useRef<boolean>(false);
  isSimulatingRef.current = isSimulating;

  // Cleanup helper
  const stopWebcam = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Initialize camera & model
  useEffect(() => {
    isMountedRef.current = true;
    isCompletedRef.current = false;
    let detector: any = null;

    async function init() {
      setIsModelLoading(true);
      setCameraError(null);

      try {
        // 1. Load TensorFlow MoveNet Model
        detector = await getPoseDetector();
        if (!isMountedRef.current) return;
        setIsModelLoading(false);

        // 2. Request Camera Stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (!isMountedRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (!isMountedRef.current) return;
            const w = videoRef.current?.videoWidth || 640;
            const h = videoRef.current?.videoHeight || 480;
            setVideoDimensions({ width: w, height: h });
            videoRef.current?.play().then(() => {
              startPoseLoop(detector);
            }).catch(console.error);
          };
        }
      } catch (err: any) {
        console.error('Initialization error:', err);
        if (isMountedRef.current) {
          setIsModelLoading(false);
          const errorMsg =
            err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
              ? 'WEBCAM ACCESS DENIED. USE DEMO SIMULATOR BELOW.'
              : err.name === 'NotFoundError'
              ? 'NO CAMERA FOUND. USE DEMO SIMULATOR BELOW.'
              : 'CAMERA UNAVAILABLE. USE DEMO SIMULATOR BELOW.';
          setCameraError(errorMsg);
          startPoseLoop(detector);
        }
      }
    }

    init();

    return () => {
      isMountedRef.current = false;
      stopWebcam();
    };
  }, [move.id, stopWebcam]);

  // Main continuous requestAnimationFrame loop
  const startPoseLoop = useCallback(
    (detector: any) => {
      const processFrame = async () => {
        if (!isMountedRef.current || isCompletedRef.current) return;

        let detectedPose: Pose | null = null;

        if (isSimulatingRef.current) {
          detectedPose = generateSyntheticPose(move.id, videoDimensions.width, videoDimensions.height);
        } else if (detector && videoRef.current && videoRef.current.readyState >= 2) {
          detectedPose = await estimatePoseFromVideo(detector, videoRef.current);
        }

        if (isMountedRef.current && !isCompletedRef.current) {
          setCurrentPose(detectedPose);

          if (detectedPose) {
            const evalResult = evaluatePoseForMove(move.id, detectedPose);
            setEvaluation(evalResult);

            const now = performance.now();

            if (evalResult.isMatch) {
              if (holdStartTimeRef.current === null) {
                holdStartTimeRef.current = now;
              }

              const elapsed = now - holdStartTimeRef.current;
              const progress = Math.min(elapsed / HOLD_DURATION_MS, 1.0);
              const remaining = Math.max(0, (HOLD_DURATION_MS - elapsed) / 1000);

              setHoldProgress(progress);
              setRemainingSec(remaining);

              // Sound tick every 400ms while holding
              if (now - lastTickSoundTime.current > 380) {
                lastTickSoundTime.current = now;
                playHoldTick(1.0 + progress * 0.5);
              }

              // SUCCESS TRIGGER
              if (progress >= 1.0 && !isCompletedRef.current) {
                isCompletedRef.current = true;
                onMoveSuccess(move);
                return;
              }
            } else {
              holdStartTimeRef.current = null;
              setHoldProgress(0);
              setRemainingSec(HOLD_DURATION_MS / 1000);
            }
          } else {
            setEvaluation({
              isMatch: false,
              score: 0,
              feedback: 'STEP INTO CAMERA FRAME',
            });
            holdStartTimeRef.current = null;
            setHoldProgress(0);
            setRemainingSec(HOLD_DURATION_MS / 1000);
          }
        }

        if (isMountedRef.current && !isCompletedRef.current) {
          animationFrameRef.current = requestAnimationFrame(processFrame);
        }
      };

      animationFrameRef.current = requestAnimationFrame(processFrame);
    },
    [move, onMoveSuccess, videoDimensions.width, videoDimensions.height]
  );

  return (
    <div className="w-full flex-1 flex flex-col justify-center font-stefan">
      {/* Main Stage Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch h-[62vh] max-h-[500px]">
        {/* Left / Center Video Stage (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center min-h-0">
          <WiggleBox
            className="w-full h-full min-h-[300px] overflow-hidden flex items-center justify-center relative rounded-2xl"
            borderRadius={16}
            strokeWidth={2.75}
            borderOnTop
          >
            <div className="relative w-full h-full overflow-hidden rounded-2xl flex items-center justify-center">
              {/* Loading MoveNet Indicator */}
              {isModelLoading && (
                <div className="absolute inset-0 z-30 bg-white flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-black animate-spin" />
                  <div className="text-xl font-bold text-black uppercase">
                    LOADING MOVENET ENGINE...
                  </div>
                </div>
              )}

              {/* Camera Error / Permission Fallback */}
              {cameraError && !isSimulating && (
                <div className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <CameraOff className="w-8 h-8 text-black" />
                  <h4 className="text-xl font-bold text-black uppercase">
                    CAMERA ACCESS REQUIRED
                  </h4>
                  <p className="text-sm text-black max-w-md uppercase">
                    {cameraError}
                  </p>
                  <button
                    onClick={() => setIsSimulating(true)}
                    className="wiggle-on-hover px-5 py-2.5 text-black text-base uppercase cursor-pointer"
                  >
                    ACTIVATE POSE SIMULATOR
                  </button>
                </div>
              )}

              {/* Webcam Video Stream (mirrored) */}
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Skeleton Canvas Overlay */}
              <SkeletonCanvas
                pose={currentPose}
                width={videoDimensions.width}
                height={videoDimensions.height}
                isMatch={evaluation.isMatch}
                score={evaluation.score}
                mirrored={true}
              />

              {/* Top Overlay: Pose Match & Hint Feedback */}
              <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
                <div
                  className={`px-4 py-2 rounded-2xl text-[18pt] font-normal uppercase border-2 transition-all duration-200 shadow-md ${
                    evaluation.isMatch
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black'
                  }`}
                >
                  <span>{evaluation.feedback}</span>
                </div>
              </div>

              {/* Bottom Floating Hold Timer Ring */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
                <HoldTimerRing
                  progress={holdProgress}
                  remainingSeconds={remainingSec}
                  isMatching={evaluation.isMatch}
                  size={95}
                />
              </div>
            </div>
          </WiggleBox>
        </div>

        {/* Right Instructions & Move Guide Sidebar (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 min-h-0">
          {/* Move Info Card with WiggleBox */}
          <WiggleBox
            className="p-4 text-black flex-1 overflow-hidden"
            borderRadius={16}
            strokeWidth={2}
          >
            <div className="h-full flex flex-col gap-2">
              <h3 className="text-[18pt] font-normal uppercase tracking-wider">
                {move.name}
              </h3>

              <ul className="list-disc pl-5 text-[18pt] leading-[1.05] uppercase tracking-wide space-y-1">
                {move.instructions.map((step, idx) => <li key={idx}>{step}</li>)}
              </ul>
              <p className="mt-auto text-[18pt] uppercase tracking-wide">HOLD POSE FOR {move.estimatedHoldTimeSec} SEC.</p>
            </div>
          </WiggleBox>

          {/* Test / Demo Pose button under the instructions */}
          <div>
            <SimulatorControls
              currentMoveId={move.id}
              isSimulating={isSimulating}
              onToggleSimulation={setIsSimulating}
              onInjectSimulatedPose={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
