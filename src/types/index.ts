import type { Pose } from '@tensorflow-models/pose-detection';

export type DanceMoveId = 'dab' | 'whip' | 'woah';

export interface DanceMove {
  id: DanceMoveId;
  name: string;
  tagline: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Iconic';
  estimatedHoldTimeSec: number;
  instructions: string[];
  keypointsFocus: string[];
  svgIcon: string;
  illustrationSrc?: string;
  bgGradient: string;
  accentColor: string;
}

export interface FunFact {
  id: string;
  moveId: DanceMoveId;
  category: string;
  title: string;
  fact: string;
  quote?: string;
  badge?: string;
  imageSrc?: string;
  unlockedAt?: string;
}

export interface PoseEvaluationResult {
  isMatch: boolean;
  score: number; // 0 to 1
  feedback: string;
  stageDetails?: Record<string, boolean>;
}

export interface DetectedSkeletonData {
  pose: Pose | null;
  evaluation: PoseEvaluationResult;
}

export type AppView = 'menu' | 'camera' | 'reward' | 'complete' | 'party';
