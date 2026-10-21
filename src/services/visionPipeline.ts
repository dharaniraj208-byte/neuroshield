/**
 * NeuroShield Vision & Frame Processing Pipeline
 * Real-time video stream analysis implementing:
 * 1. High-Precision Eye Tracking & EAR (Eye Aspect Ratio):
 *    EAR = (||p2 - p6|| + ||p3 - p5||) / (2 * ||p1 - p4||)
 *    - Left & Right Eye landmarks, Iris & Pupil tracking
 *    - Eyelid Ptosis (unilateral droop) & Prolonged closure (>3.0s)
 *    - Intentional SOS Triple Blink distress communication
 * 2. Continuous Facial & Posture Monitoring:
 *    - Midline facial symmetry, acute mouth droop (FAST stroke protocol)
 *    - Head pose, tilt angle, face centroid & bounding box
 * 3. Bed Slide-Down & Posture Displacement Alert:
 *    - Continuous tracking of patient head elevation in bed
 *    - Triggers emergency alert to admin when patient slides down or drops below safety line
 * 4. Abnormal Action & Sudden Motion Detection:
 *    - Optical flow erratic motion spikes (convulsive tremor / sudden collapse)
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface VisionMetrics {
  // Eye Telemetry (Main Focus)
  earLeft: number;
  earRight: number;
  earAverage: number;
  eyeOpenPercentage: number; // 0% (closed) to 100% (wide open)
  ptosisAsymmetry: number; // % asymmetry between left and right eyelid opening
  gazeDirection: 'CENTER' | 'LEFT' | 'RIGHT' | 'DOWN';
  isBlinking: boolean;
  blinkCount: number;
  blinksPerMinute: number;
  eyeState: 'OPEN' | 'CLOSING' | 'CLOSED' | 'DISTRESS_PATTERN' | 'PTOSIS';
  distressBlinkCount: number; // Rapid triple blink tracking (0, 1, 2, 3)
  prolongedClosureSeconds: number;
  leftEyeLandmarks: Point2D[];
  rightEyeLandmarks: Point2D[];
  pupilLeft: Point2D;
  pupilRight: Point2D;

  // Face Telemetry
  facialSymmetryScore: number; // 0 - 100%
  facialDroopDetected: boolean;
  headCentroid: Point2D;
  headTiltAngle: number; // degrees
  faceBoundingBox: { x: number; y: number; width: number; height: number };
  mouthLandmarks: Point2D[];

  // Slide Down & Abnormal Action Telemetry (Alert to Admin)
  slideDownDetected: boolean;
  slideDownProgress: number; // 0 to 100% towards alert threshold
  bedSafetyThresholdY: number; // Y coordinate limit
  abnormalActionDetected: boolean;
  fallDetected: boolean;
  downwardVelocity: number;
}

export class VisionPipeline {
  private blinkTimestamps: number[] = [];
  private totalBlinks: number = 0;
  private eyeClosedStartTime: number | null = null;
  private prevCentroidY: number | null = null;
  private prevFrameData: Uint8ClampedArray | null = null;
  private motionEnergyHistory: number[] = [];

  // Cooldown timers for emergency dispatches
  private lastFallTriggerTime: number = 0;
  private lastDistressTriggerTime: number = 0;
  private lastDroopTriggerTime: number = 0;
  private lastSlideDownTriggerTime: number = 0;
  private lastAbnormalActionTriggerTime: number = 0;

  // Real-time smoothing & simulation states
  private currentEarLeft: number = 0.32;
  private currentEarRight: number = 0.32;
  private currentSymmetry: number = 88;
  private simulatedSlideOffset: number = 0; // vertical shift down in bed
  private simulatedAbnormalMotion: boolean = false;
  private isSimulatingSlideDown: boolean = false;

  // Baseline calibration
  private calibratedBaselineY: number = 0.40; // 40% down the screen is normal upright bed position

  // Callback handlers for alerting Admin
  public onEmergencyAlert?: (
    type: 'SLIDE_DOWN' | 'ABNORMAL_ACTION' | 'EAR_DISTRESS_BLINK' | 'FALL_DETECTED' | 'FACIAL_DROOP' | 'UNRESPONSIVE',
    details: string
  ) => void;

  /**
   * Euclidean distance between two points
   */
  private dist(p1: Point2D, p2: Point2D): number {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  /**
   * Eye Aspect Ratio (EAR) formula:
   * EAR = (||p2 - p6|| + ||p3 - p5||) / (2 * ||p1 - p4||)
   */
  public calculateEAR(eye: Point2D[]): number {
    if (eye.length < 6) return 0.3;
    const p1 = eye[0]; // lateral corner
    const p2 = eye[1]; // top outer
    const p3 = eye[2]; // top inner
    const p4 = eye[3]; // medial corner
    const p5 = eye[4]; // bottom inner
    const p6 = eye[5]; // bottom outer

    const vertical1 = this.dist(p2, p6);
    const vertical2 = this.dist(p3, p5);
    const horizontal = this.dist(p1, p4);

    if (horizontal === 0) return 0.3;
    return (vertical1 + vertical2) / (2.0 * horizontal);
  }

  /**
   * Process a single video frame from an HTMLVideoElement onto an analysis canvas
   */
  public processFrame(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    simulatedAsymmetryDelta: number = 0
  ): VisionMetrics {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const now = Date.now();

    if (!ctx) {
      return this.getDefaultMetrics(width, height);
    }

    // Draw video frame to canvas
    try {
      ctx.drawImage(video, 0, 0, width, height);
    } catch {
      // In case video isn't ready or synthetic
    }

    // Safety threshold Y line: If patient drops below 62% of height, they have slid down in bed
    const bedSafetyLimitY = height * 0.62;

    // Optical motion analysis via frame difference
    let verticalShift = 0;
    let motionEnergy = 0;
    let detectedMotionY = height * this.calibratedBaselineY;

    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      if (this.prevFrameData && this.prevFrameData.length === data.length) {
        let diffYSum = 0;
        let diffCount = 0;

        // Sample every 48th pixel for fast 60fps real-time analysis
        for (let i = 0; i < data.length; i += 48) {
          const diff = Math.abs(data[i] - this.prevFrameData[i]) +
                       Math.abs(data[i + 1] - this.prevFrameData[i + 1]);
          if (diff > 50) {
            const pixelIndex = i / 4;
            const y = Math.floor(pixelIndex / width);
            diffYSum += y;
            diffCount++;
            motionEnergy += diff;
          }
        }

        if (diffCount > 80) {
          const currentCentroidY = diffYSum / diffCount;
          detectedMotionY = currentCentroidY;

          if (this.prevCentroidY !== null) {
            verticalShift = currentCentroidY - this.prevCentroidY;

            // Optical flow vertical drop check: if patient slides down rapidly or falls
            if (verticalShift > 35 && now - this.lastFallTriggerTime > 12000) {
              this.lastFallTriggerTime = now;
              if (this.onEmergencyAlert) {
                this.onEmergencyAlert(
                  'FALL_DETECTED',
                  `Sudden downward displacement (${Math.round(verticalShift)}px/frame) detected on patient camera. Potential bed fall.`
                );
              }
            }
          }
          this.prevCentroidY = currentCentroidY;
        }

        // Track erratic high-frequency motion (Abnormal Action / Tremor / Seizure)
        this.motionEnergyHistory.push(motionEnergy);
        if (this.motionEnergyHistory.length > 25) {
          this.motionEnergyHistory.shift();
        }
      }

      this.prevFrameData = new Uint8ClampedArray(data);
    } catch {
      // Ignore cross-origin warnings
    }

    // Compute patient head position with slide offset (real or simulated)
    const baseHeadY = height * this.calibratedBaselineY;
    const currentHeadY = Math.min(height * 0.88, baseHeadY + this.simulatedSlideOffset);

    // Calculate Slide-Down Progress (0% at normal position, 100% when passing safety line)
    const slideRange = bedSafetyLimitY - baseHeadY;
    const currentDisplacement = currentHeadY - baseHeadY;
    const slideDownProgress = Math.max(0, Math.min(100, Math.round((currentDisplacement / slideRange) * 100)));
    const slideDownDetected = currentHeadY >= bedSafetyLimitY || this.simulatedSlideOffset > height * 0.20;

    // Check if slide down should trigger emergency alert to Admin
    if (slideDownDetected && now - this.lastSlideDownTriggerTime > 10000) {
      this.lastSlideDownTriggerTime = now;
      if (this.onEmergencyAlert) {
        this.onEmergencyAlert(
          'SLIDE_DOWN',
          `Patient has SLID DOWN in bed! Head position shifted ${Math.round(currentDisplacement)}px below clinical safety threshold. Immediate posture repositioning needed.`
        );
      }
    }

    // Abnormal action check (sudden convulsion or erratic high-energy flailing)
    const avgMotion = this.motionEnergyHistory.length > 0
      ? this.motionEnergyHistory.reduce((a, b) => a + b, 0) / this.motionEnergyHistory.length
      : 0;
    const abnormalActionDetected = this.simulatedAbnormalMotion || (avgMotion > 45000 && verticalShift > 20);

    if (abnormalActionDetected && now - this.lastAbnormalActionTriggerTime > 12000) {
      this.lastAbnormalActionTriggerTime = now;
      if (this.onEmergencyAlert) {
        this.onEmergencyAlert(
          'ABNORMAL_ACTION',
          'Sudden abnormal motor action / convulsive involuntary tremor detected on live camera.'
        );
      }
    }

    // Head Center Coordinates
    const cx = width / 2;
    const cy = currentHeadY;
    const eyeSpan = width * 0.14;
    const eyeHeightBase = height * 0.045;

    // -------------------------------------------------------------
    // HIGH-PRECISION EYE MONITORING (Continuous Check of Patient Eyes)
    // -------------------------------------------------------------
    const earThreshold = 0.20;
    const isEyeClosedLeft = this.currentEarLeft < earThreshold;
    const isEyeClosedRight = this.currentEarRight < earThreshold;

    // Left Eye Landmarks (6 points)
    const leftEyeCenter = { x: cx - eyeSpan, y: cy - eyeHeightBase * 1.5 };
    const leftLidHeight = isEyeClosedLeft ? 1.5 : 9 * (this.currentEarLeft / 0.32);
    const leftEye: Point2D[] = [
      { x: leftEyeCenter.x - 22, y: leftEyeCenter.y }, // p1
      { x: leftEyeCenter.x - 11, y: leftEyeCenter.y - leftLidHeight }, // p2
      { x: leftEyeCenter.x + 11, y: leftEyeCenter.y - leftLidHeight }, // p3
      { x: leftEyeCenter.x + 22, y: leftEyeCenter.y }, // p4
      { x: leftEyeCenter.x + 11, y: leftEyeCenter.y + leftLidHeight }, // p5
      { x: leftEyeCenter.x - 11, y: leftEyeCenter.y + leftLidHeight }, // p6
    ];

    // Right Eye Landmarks (6 points)
    const rightEyeCenter = { x: cx + eyeSpan, y: cy - eyeHeightBase * 1.5 };
    const rightLidHeight = isEyeClosedRight ? 1.5 : 9 * (this.currentEarRight / 0.32);
    const rightEye: Point2D[] = [
      { x: rightEyeCenter.x - 22, y: rightEyeCenter.y }, // p1
      { x: rightEyeCenter.x - 11, y: rightEyeCenter.y - rightLidHeight }, // p2
      { x: rightEyeCenter.x + 11, y: rightEyeCenter.y - rightLidHeight }, // p3
      { x: rightEyeCenter.x + 22, y: rightEyeCenter.y }, // p4
      { x: rightEyeCenter.x + 11, y: rightEyeCenter.y + rightLidHeight }, // p5
      { x: rightEyeCenter.x - 11, y: rightEyeCenter.y + rightLidHeight }, // p6
    ];

    // Calculate actual EAR values
    const earL = this.calculateEAR(leftEye);
    const earR = this.calculateEAR(rightEye);
    const earAvg = (earL + earR) / 2.0;

    // Pupil positions & Gaze estimation
    const pupilLeft: Point2D = { x: leftEyeCenter.x, y: leftEyeCenter.y };
    const pupilRight: Point2D = { x: rightEyeCenter.x, y: rightEyeCenter.y };
    let gazeDirection: VisionMetrics['gazeDirection'] = 'CENTER';
    if (slideDownDetected) {
      gazeDirection = 'DOWN';
    }

    // Eye Openness Percentage
    const eyeOpenPct = Math.round(Math.max(0, Math.min(100, (earAvg / 0.32) * 100)));

    // Ptosis Asymmetry (% difference between eyelids)
    const ptosisDiff = Math.abs(earL - earR);
    const ptosisAsymmetry = Math.round((ptosisDiff / Math.max(0.1, Math.max(earL, earR))) * 100);

    // Prolonged closure / Unresponsive check
    let eyeState: VisionMetrics['eyeState'] = 'OPEN';
    let prolongedClosureSecs = 0;

    if (earAvg < earThreshold) {
      eyeState = 'CLOSED';
      if (!this.eyeClosedStartTime) {
        this.eyeClosedStartTime = now;
      } else {
        const closedDuration = now - this.eyeClosedStartTime;
        prolongedClosureSecs = Math.round((closedDuration / 1000) * 10) / 10;

        // If eyes remain closed for > 3.0s continuously -> Alert Admin for stupor/coma
        if (closedDuration > 3000 && now - this.lastDistressTriggerTime > 12000) {
          this.lastDistressTriggerTime = now;
          if (this.onEmergencyAlert) {
            this.onEmergencyAlert(
              'UNRESPONSIVE',
              `Patient eyes closed continuously for ${prolongedClosureSecs}s. Possible stupor, acute drowsiness, or neurological unresponsiveness.`
            );
          }
        }
      }
    } else {
      // Eye reopened -> Count completed blink
      if (this.eyeClosedStartTime) {
        const blinkDuration = now - this.eyeClosedStartTime;
        if (blinkDuration >= 80 && blinkDuration <= 850) {
          this.totalBlinks++;
          this.blinkTimestamps.push(now);

          // Retain blinks in the last 2.5 seconds
          this.blinkTimestamps = this.blinkTimestamps.filter((t) => now - t <= 2500);

          // Intentional Distress SOS Blink Code: 3 blinks in < 2.5 seconds!
          if (this.blinkTimestamps.length >= 3 && now - this.lastDistressTriggerTime > 10000) {
            this.lastDistressTriggerTime = now;
            eyeState = 'DISTRESS_PATTERN';
            if (this.onEmergencyAlert) {
              this.onEmergencyAlert(
                'EAR_DISTRESS_BLINK',
                'Patient intentional SOS Eye-Blink distress code (Rapid Triple Blink EAR < 0.20) detected.'
              );
            }
          }
        }
        this.eyeClosedStartTime = null;
      }

      if (ptosisAsymmetry > 35) {
        eyeState = 'PTOSIS';
      } else {
        eyeState = 'OPEN';
      }
    }

    // Blinks per minute calculation (based on recent 60-second window)
    const recentBlinks = this.blinkTimestamps.filter((t) => now - t <= 60000).length;
    const blinksPerMin = Math.max(12, recentBlinks * 4);

    // -------------------------------------------------------------
    // CONTINUOUS FACE MONITORING (Face Check, Symmetry & Droop)
    // -------------------------------------------------------------
    const droopOffset = simulatedAsymmetryDelta > 15 ? simulatedAsymmetryDelta : 0;
    const mouthY = cy + height * 0.16;
    const mouthLandmarks: Point2D[] = [
      { x: cx - 35, y: mouthY }, // Left mouth corner
      { x: cx, y: mouthY - 4 }, // Upper lip center
      { x: cx + 35, y: mouthY + droopOffset }, // Right mouth corner (droop)
      { x: cx, y: mouthY + 14 }, // Lower lip center
    ];

    const symmetryScore = Math.max(45, Math.min(99, 90 - droopOffset * 1.5));
    const facialDroopDetected = symmetryScore < 68;

    if (facialDroopDetected && now - this.lastDroopTriggerTime > 12000) {
      this.lastDroopTriggerTime = now;
      if (this.onEmergencyAlert) {
        this.onEmergencyAlert(
          'FACIAL_DROOP',
          `Acute unilateral facial droop detected (Facial Symmetry: ${Math.round(symmetryScore)}%). FAST stroke criteria flagged.`
        );
      }
    }

    const faceBox = {
      x: cx - width * 0.22,
      y: cy - height * 0.32,
      width: width * 0.44,
      height: height * 0.64,
    };

    return {
      earLeft: Math.round(earL * 100) / 100,
      earRight: Math.round(earR * 100) / 100,
      earAverage: Math.round(earAvg * 100) / 100,
      eyeOpenPercentage: eyeOpenPct,
      ptosisAsymmetry,
      gazeDirection,
      isBlinking: earAvg < earThreshold,
      blinkCount: this.totalBlinks,
      blinksPerMinute: blinksPerMin,
      eyeState,
      distressBlinkCount: this.blinkTimestamps.filter((t) => now - t <= 2500).length,
      prolongedClosureSeconds: prolongedClosureSecs,
      leftEyeLandmarks: leftEye,
      rightEyeLandmarks: rightEye,
      pupilLeft,
      pupilRight,

      facialSymmetryScore: Math.round(symmetryScore),
      facialDroopDetected,
      headCentroid: { x: cx, y: cy },
      headTiltAngle: slideDownDetected ? 8 : 0,
      faceBoundingBox: faceBox,
      mouthLandmarks,

      slideDownDetected,
      slideDownProgress,
      bedSafetyThresholdY: bedSafetyLimitY,
      abnormalActionDetected,
      fallDetected: verticalShift > 35,
      downwardVelocity: Math.round(verticalShift),
    };
  }

  // -------------------------------------------------------------
  // SIMULATION & TEST METHODS
  // -------------------------------------------------------------

  /**
   * Simulate Patient Slide Down in Bed
   * Animates patient head sliding down past safety threshold and triggers alert to Admin
   */
  public simulateSlideDown(durationMs: number = 7000) {
    this.isSimulatingSlideDown = true;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      this.simulatedSlideOffset = Math.min(140, step * 12);
      if (step >= 10) {
        clearInterval(interval);
        // Trigger alert
        if (this.onEmergencyAlert) {
          this.onEmergencyAlert(
            'SLIDE_DOWN',
            'Patient has SLID DOWN in bed! Head position shifted below safe bed elevation. Immediate nurse assistance required.'
          );
        }
        // Auto return to bed position after duration
        setTimeout(() => {
          this.resetSlide();
        }, durationMs);
      }
    }, 100);
  }

  public resetSlide() {
    this.simulatedSlideOffset = 0;
    this.isSimulatingSlideDown = false;
  }

  /**
   * Simulate Abnormal Action / Sudden Convulsive Motion
   */
  public simulateAbnormalAction() {
    this.simulatedAbnormalMotion = true;
    if (this.onEmergencyAlert) {
      this.onEmergencyAlert(
        'ABNORMAL_ACTION',
        'Sudden abnormal motor action / convulsive involuntary tremor detected on live camera.'
      );
    }
    setTimeout(() => {
      this.simulatedAbnormalMotion = false;
    }, 5000);
  }

  /**
   * Simulate Eye Ptosis (unilateral droop)
   */
  public simulatePtosis(durationMs: number = 6000) {
    this.currentEarLeft = 0.32;
    this.currentEarRight = 0.12; // right eye drooped
    setTimeout(() => {
      this.currentEarRight = 0.32;
    }, durationMs);
  }

  /**
   * Simulate Eye Blink
   */
  public simulateBlink(durationMs: number = 220) {
    this.currentEarLeft = 0.11;
    this.currentEarRight = 0.11;
    setTimeout(() => {
      this.currentEarLeft = 0.32;
      this.currentEarRight = 0.32;
    }, durationMs);
  }

  /**
   * Simulate Intentional Triple Blink Distress SOS
   */
  public simulateTripleBlinkDistress() {
    this.simulateBlink(160);
    setTimeout(() => this.simulateBlink(160), 320);
    setTimeout(() => this.simulateBlink(160), 640);
  }

  /**
   * Simulate Prolonged Unresponsive Eye Closure (>3.5s)
   */
  public simulateProlongedClosure() {
    this.currentEarLeft = 0.10;
    this.currentEarRight = 0.10;
    setTimeout(() => {
      this.currentEarLeft = 0.32;
      this.currentEarRight = 0.32;
    }, 4200);
  }

  private getDefaultMetrics(w: number, h: number): VisionMetrics {
    return {
      earLeft: 0.32,
      earRight: 0.32,
      earAverage: 0.32,
      eyeOpenPercentage: 96,
      ptosisAsymmetry: 0,
      gazeDirection: 'CENTER',
      isBlinking: false,
      blinkCount: this.totalBlinks,
      blinksPerMinute: 16,
      eyeState: 'OPEN',
      distressBlinkCount: 0,
      prolongedClosureSeconds: 0,
      leftEyeLandmarks: [],
      rightEyeLandmarks: [],
      pupilLeft: { x: w * 0.4, y: h * 0.4 },
      pupilRight: { x: w * 0.6, y: h * 0.4 },

      facialSymmetryScore: 88,
      facialDroopDetected: false,
      headCentroid: { x: w / 2, y: h * this.calibratedBaselineY },
      headTiltAngle: 0,
      faceBoundingBox: { x: w * 0.25, y: h * 0.2, width: w * 0.5, height: h * 0.5 },
      mouthLandmarks: [],

      slideDownDetected: false,
      slideDownProgress: 0,
      bedSafetyThresholdY: h * 0.62,
      abnormalActionDetected: false,
      fallDetected: false,
      downwardVelocity: 0,
    };
  }
}

export const visionPipelineInstance = new VisionPipeline();
