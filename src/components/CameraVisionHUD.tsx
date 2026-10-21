import React, { useRef, useEffect, useState } from 'react';
import { useNeuro } from '../context/NeuroContext';
import { visionPipelineInstance, VisionMetrics } from '../services/visionPipeline';
import {
  Camera,
  Mic,
  Maximize2,
  Minimize2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Activity,
  Sliders,
  CheckCircle2,
  Volume2,
  Zap,
  ArrowDownCircle,
  ShieldAlert,
  ChevronDown,
  Compass,
  Bed,
  Flame,
  Radio
} from 'lucide-react';

interface CameraVisionHUDProps {
  mode?: 'floating' | 'embedded' | 'fullscreen';
  className?: string;
}

export const CameraVisionHUD: React.FC<CameraVisionHUDProps> = ({ mode = 'embedded', className = '' }) => {
  const {
    mediaStream,
    cameraActive,
    micActive,
    cameraError,
    videoRef,
    startMedia,
    facialSymmetry,
    setFacialSymmetry,
    armStability,
    micVolume,
    earValue,
    setEarValue,
    blinkCount,
    eyeState,
    distressBlinkProgress,
    simulateEarDistress,
    simulateEyePtosis,
    simulateSlideDown,
    simulateAbnormalAction,
    slideDownProgress,
    setSlideDownProgress,
    triggerEmergency,
    t
  } = useNeuro();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showMeshOverlay, setShowMeshOverlay] = useState<boolean>(true);
  const [showEyeCrosshairs, setShowEyeCrosshairs] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<VisionMetrics | null>(null);
  const [simulatedDroop, setSimulatedDroop] = useState<number>(0);
  const [isSlidingDownAnim, setIsSlidingDownAnim] = useState<boolean>(false);

  // Hook pipeline emergency alert callback to context triggerEmergency
  useEffect(() => {
    visionPipelineInstance.onEmergencyAlert = (type, details) => {
      triggerEmergency(type as any, details);
    };
  }, [triggerEmergency]);

  // Frame processing loop using VisionPipeline
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;
    const processLoop = () => {
      tick += 0.04;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (videoRef.current && cameraActive) {
        // Run vision frame pipeline
        const frameMetrics = visionPipelineInstance.processFrame(
          videoRef.current,
          canvas,
          simulatedDroop
        );
        setMetrics(frameMetrics);
        setEarValue(frameMetrics.earAverage);
        setSlideDownProgress(frameMetrics.slideDownProgress);

        // Draw overlays if enabled
        if (showMeshOverlay) {
          const cx = frameMetrics.headCentroid.x;
          const cy = frameMetrics.headCentroid.y;
          const breath = Math.sin(tick) * 2;

          // -------------------------------------------------------------
          // 1. BED SAFETY & SLIDE-DOWN POSTURE GUIDES
          // -------------------------------------------------------------
          const baselineY = height * 0.40;
          const dangerThresholdY = frameMetrics.bedSafetyThresholdY;

          // Calibrated Safe Elevation Line (Green dashed)
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.45)';
          ctx.setLineDash([6, 6]);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(20, baselineY);
          ctx.lineTo(width - 20, baselineY);
          ctx.stroke();

          ctx.font = '9px monospace';
          ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
          ctx.fillText('BED POSTURE BASELINE (SAFE)', 24, baselineY - 4);

          // Danger Slide-Down Line (Red dashed)
          ctx.strokeStyle = frameMetrics.slideDownDetected
            ? 'rgba(239, 68, 68, 0.9)'
            : 'rgba(239, 68, 68, 0.45)';
          ctx.lineWidth = frameMetrics.slideDownDetected ? 2.5 : 1.5;
          ctx.beginPath();
          ctx.moveTo(20, dangerThresholdY);
          ctx.lineTo(width - 20, dangerThresholdY);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = frameMetrics.slideDownDetected ? '#ef4444' : 'rgba(239, 68, 68, 0.8)';
          ctx.fillText('CRITICAL BED SLIDE-DOWN THRESHOLD', 24, dangerThresholdY - 4);

          // Head Centroid Posture Dot & Drop Vector
          ctx.strokeStyle = frameMetrics.slideDownDetected ? '#ef4444' : '#38bdf8';
          ctx.fillStyle = frameMetrics.slideDownDetected ? 'rgba(239, 68, 68, 0.5)' : 'rgba(56, 189, 248, 0.5)';
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // -------------------------------------------------------------
          // 2. FACE TRACKING MESH & MIDLINE SYMMETRY
          // -------------------------------------------------------------
          // Face Oval
          ctx.strokeStyle = frameMetrics.facialDroopDetected
            ? 'rgba(244, 63, 94, 0.9)'
            : frameMetrics.slideDownDetected
            ? 'rgba(239, 68, 68, 0.9)'
            : 'rgba(34, 197, 94, 0.75)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy + breath, width * 0.22, height * 0.32, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Symmetry Midline Axis
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(cx, cy - height * 0.35);
          ctx.lineTo(cx, cy + height * 0.35);
          ctx.stroke();
          ctx.setLineDash([]);

          // -------------------------------------------------------------
          // 3. MAIN FOCUS: PATIENT EYE MONITORING & TRACKING
          // -------------------------------------------------------------
          // Left Eye Polygon
          if (frameMetrics.leftEyeLandmarks.length >= 6) {
            const isLeftClosed = frameMetrics.earLeft < 0.20;
            ctx.strokeStyle = isLeftClosed ? '#f43f5e' : '#38bdf8';
            ctx.fillStyle = isLeftClosed ? 'rgba(244, 63, 94, 0.35)' : 'rgba(56, 189, 248, 0.2)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(frameMetrics.leftEyeLandmarks[0].x, frameMetrics.leftEyeLandmarks[0].y);
            for (let i = 1; i < 6; i++) {
              ctx.lineTo(frameMetrics.leftEyeLandmarks[i].x, frameMetrics.leftEyeLandmarks[i].y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            // Pupil Reticle / Crosshair (+)
            if (showEyeCrosshairs && !isLeftClosed) {
              const px = frameMetrics.pupilLeft.x;
              const py = frameMetrics.pupilLeft.y;
              ctx.strokeStyle = '#0284c7';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(px, py, 6, 0, Math.PI * 2);
              ctx.moveTo(px - 10, py);
              ctx.lineTo(px + 10, py);
              ctx.moveTo(px, py - 10);
              ctx.lineTo(px, py + 10);
              ctx.stroke();
            }

            // Landmark vertices
            frameMetrics.leftEyeLandmarks.forEach((pt) => {
              ctx.fillStyle = '#38bdf8';
              ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
            });
          }

          // Right Eye Polygon
          if (frameMetrics.rightEyeLandmarks.length >= 6) {
            const isRightClosed = frameMetrics.earRight < 0.20;
            ctx.strokeStyle = isRightClosed ? '#f43f5e' : '#38bdf8';
            ctx.fillStyle = isRightClosed ? 'rgba(244, 63, 94, 0.35)' : 'rgba(56, 189, 248, 0.2)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(frameMetrics.rightEyeLandmarks[0].x, frameMetrics.rightEyeLandmarks[0].y);
            for (let i = 1; i < 6; i++) {
              ctx.lineTo(frameMetrics.rightEyeLandmarks[i].x, frameMetrics.rightEyeLandmarks[i].y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            // Pupil Reticle / Crosshair (+)
            if (showEyeCrosshairs && !isRightClosed) {
              const px = frameMetrics.pupilRight.x;
              const py = frameMetrics.pupilRight.y;
              ctx.strokeStyle = '#0284c7';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(px, py, 6, 0, Math.PI * 2);
              ctx.moveTo(px - 10, py);
              ctx.lineTo(px + 10, py);
              ctx.moveTo(px, py - 10);
              ctx.lineTo(px, py + 10);
              ctx.stroke();
            }

            // Landmark vertices
            frameMetrics.rightEyeLandmarks.forEach((pt) => {
              ctx.fillStyle = '#38bdf8';
              ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
            });
          }

          // Eyelid Ptosis (Asymmetry) warning tag on canvas
          if (frameMetrics.ptosisAsymmetry > 35) {
            ctx.font = '10px monospace';
            ctx.fillStyle = '#f59e0b';
            ctx.fillText('! PTOSIS ASYMMETRY DETECTED', cx - 70, cy - height * 0.24);
          }

          // -------------------------------------------------------------
          // 4. MOUTH & FACIAL DROOP CURVE
          // -------------------------------------------------------------
          if (frameMetrics.mouthLandmarks.length >= 4) {
            const [pLeft, pTop, pRight, pBottom] = frameMetrics.mouthLandmarks;
            ctx.strokeStyle = frameMetrics.facialDroopDetected ? '#f43f5e' : '#22c55e';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(pLeft.x, pLeft.y);
            ctx.quadraticCurveTo(pTop.x, pTop.y, pRight.x, pRight.y);
            ctx.stroke();

            // Corner tracking points
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(pLeft.x, pLeft.y, 3.5, 0, Math.PI * 2);
            ctx.arc(pRight.x, pRight.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // -------------------------------------------------------------
          // 5. SLIDE-DOWN CRITICAL FLASHING OVERLAY
          // -------------------------------------------------------------
          if (frameMetrics.slideDownDetected) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
            ctx.fillRect(0, 0, width, height);

            ctx.font = 'bold 16px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText('CRITICAL: PATIENT SLID DOWN IN BED', width / 2, 45);

            ctx.font = '11px monospace';
            ctx.fillStyle = '#fecaca';
            ctx.fillText('AUTO-DISPATCHING URGENT ALERT & CALL TO ADMIN...', width / 2, 65);
            ctx.textAlign = 'start';
          }
        }
      }

      animationFrameId = requestAnimationFrame(processLoop);
    };

    processLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cameraActive, showMeshOverlay, showEyeCrosshairs, simulatedDroop, videoRef, setEarValue, setSlideDownProgress]);

  // Handler for testing Slide Down
  const handleTestSlideDown = () => {
    setIsSlidingDownAnim(true);
    simulateSlideDown();
    setTimeout(() => setIsSlidingDownAnim(false), 8000);
  };

  // Handler for testing Abnormal Action / Convulsion
  const handleTestAbnormalAction = () => {
    simulateAbnormalAction();
  };

  // Handler for testing Eye Ptosis / Closure
  const handleTestEyePtosis = () => {
    simulateEyePtosis();
  };

  // Handler for testing Triple Blink SOS
  const handleTestTripleBlink = () => {
    visionPipelineInstance.simulateTripleBlinkDistress();
    simulateEarDistress();
  };

  // Handler for testing Facial Droop
  const handleTestDroop = () => {
    setSimulatedDroop(35);
    setFacialSymmetry(52);
    triggerEmergency('FACIAL_DROOP', 'Severe acute facial asymmetry (35px deviation) detected on camera vision.');
    setTimeout(() => setSimulatedDroop(0), 10000);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-950 shadow-2xl transition-all duration-300 ${
        isMinimized ? 'h-24 w-72' : 'w-full'
      } ${className}`}
    >
      {/* HUD Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold tracking-wider text-slate-200">
            {t('cameraVisible').toUpperCase()}
          </span>
          <span className="rounded bg-sky-950 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-400 border border-sky-800/80">
            EYE &amp; POSTURE SENTINEL
          </span>
          <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-800 hidden sm:inline">
            AUTO-ON ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowEyeCrosshairs(!showEyeCrosshairs)}
            className={`rounded-lg p-1.5 text-xs transition-colors ${
              showEyeCrosshairs ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Eye Iris Reticles"
          >
            <Compass className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setShowMeshOverlay(!showMeshOverlay)}
            className={`rounded-lg p-1.5 text-xs transition-colors ${
              showMeshOverlay ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Landmark Overlay & Slide Lines"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={startMedia}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            title="Refresh Camera Stream"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            title={isMinimized ? 'Expand Camera' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Video & Vision Pipeline Canvas */}
      {!isMinimized && (
        <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
          {/* Live Video Feed */}
          <video
            ref={videoRef as any}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover transform scale-x-[-1]"
          />

          {/* Vision Canvas Overlay */}
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="absolute inset-0 h-full w-full pointer-events-none transform scale-x-[-1]"
          />

          {/* Top-Left Live Eye Telemetry Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
            {/* Eye Ratio & Ptosis Box */}
            <div className="flex items-center gap-2 rounded-xl bg-slate-950/90 px-3 py-1.5 backdrop-blur-md border border-slate-800 text-xs text-white shadow-lg">
              <Eye className="h-4 w-4 text-sky-400 animate-pulse" />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">Eyes:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  L: {(metrics?.earLeft || 0.32).toFixed(2)} | R: {(metrics?.earRight || 0.32).toFixed(2)}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                    metrics?.isBlinking
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : metrics?.ptosisAsymmetry && metrics.ptosisAsymmetry > 35
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {metrics?.isBlinking ? 'BLINKING' : metrics?.ptosisAsymmetry && metrics.ptosisAsymmetry > 35 ? 'PTOSIS DROOP' : 'OPEN'}
                </span>
              </div>
            </div>

            {/* Bed Posture & Slide-Down Sentinel Gauge */}
            <div
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 backdrop-blur-md border text-xs shadow-lg transition-all ${
                metrics?.slideDownDetected
                  ? 'bg-rose-950/95 border-rose-600 text-rose-200 animate-pulse'
                  : 'bg-slate-950/90 border-slate-800 text-white'
              }`}
            >
              <Bed className={`h-4 w-4 ${metrics?.slideDownDetected ? 'text-rose-400' : 'text-emerald-400'}`} />
              <span className="text-[11px] font-medium">Bed Posture:</span>
              <span className={`font-mono font-bold ${metrics?.slideDownDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
                {metrics?.slideDownDetected ? 'SLID DOWN IN BED!' : 'ELEVATED (NORMAL)'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {metrics?.slideDownProgress || 0}% drop
              </span>
            </div>
          </div>

          {/* Top-Right Distress Triple Blink Pattern Gauge */}
          <div className="absolute top-3 right-3 flex items-center gap-2 rounded-xl bg-slate-950/90 px-3 py-1.5 backdrop-blur-md border border-slate-800 text-xs text-white z-10 shadow-lg">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] text-slate-300">SOS Eye Distress:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((num) => (
                <span
                  key={num}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    (metrics?.distressBlinkCount || distressBlinkProgress) >= num
                      ? 'bg-amber-400 scale-125 animate-ping'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bottom-Left Microphone Level */}
          <div className="absolute bottom-16 left-3 flex items-center gap-2 rounded-xl bg-slate-950/90 px-3 py-1.5 backdrop-blur-md border border-slate-800 z-10">
            <Mic className="h-3.5 w-3.5 text-emerald-400" />
            <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-emerald-400 transition-all duration-75"
                style={{ width: `${Math.min(100, micVolume * 2)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-300">{micVolume} dB (Auto-On)</span>
          </div>

          {/* Bottom Interactive Feature Test Bar */}
          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center justify-between gap-1.5 bg-slate-950/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800/80 z-20">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300 pl-1">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
              <span className="hidden md:inline">Test Emergency Sentinel:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {/* Slide Down In Bed Simulator */}
              <button
                onClick={handleTestSlideDown}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-2.5 py-1 text-[11px] font-bold text-white shadow transition flex items-center gap-1 border border-rose-400/40 active:scale-95"
                title="Simulate Patient Sliding Down in Bed (Triggers Alert to Admin)"
              >
                <ArrowDownCircle className="h-3.5 w-3.5 animate-bounce" /> Slide Down
              </button>

              {/* Abnormal Action / Convulsion Simulator */}
              <button
                onClick={handleTestAbnormalAction}
                className="rounded-xl bg-purple-600 hover:bg-purple-500 px-2.5 py-1 text-[11px] font-bold text-white shadow transition flex items-center gap-1 border border-purple-400/40 active:scale-95"
                title="Simulate Sudden Abnormal Motor Action or Tremor"
              >
                <Flame className="h-3.5 w-3.5" /> Abnormal Action
              </button>

              {/* Eye Ptosis / Unilateral Droop Simulator */}
              <button
                onClick={handleTestEyePtosis}
                className="rounded-xl bg-amber-600 hover:bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow transition flex items-center gap-1 border border-amber-400/40 active:scale-95"
                title="Simulate Eye Eyelid Ptosis Droop"
              >
                <Eye className="h-3.5 w-3.5" /> Eye Ptosis
              </button>

              {/* Triple Blink SOS Simulator */}
              <button
                onClick={handleTestTripleBlink}
                className="rounded-xl bg-sky-600 hover:bg-sky-500 px-2.5 py-1 text-[11px] font-bold text-white shadow transition flex items-center gap-1 border border-sky-400/40 active:scale-95"
                title="Test Eye-Blink EAR SOS Distress Signal"
              >
                <Zap className="h-3.5 w-3.5" /> Blink SOS
              </button>

              {/* Stroke Facial Droop Simulator */}
              <button
                onClick={handleTestDroop}
                className="rounded-xl bg-red-700 hover:bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white shadow transition flex items-center gap-1 border border-red-400/40 active:scale-95"
                title="Test Acute Stroke Facial Droop"
              >
                <AlertTriangle className="h-3.5 w-3.5" /> Facial Droop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimized View Bar */}
      {isMinimized && (
        <div className="flex h-16 items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-900 border border-slate-800">
              <video
                ref={videoRef as any}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover transform scale-x-[-1]"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Patient Cam Active</p>
              <p className="text-[10px] font-mono text-sky-400">
                Eye L: {(metrics?.earLeft || 0.32).toFixed(2)} • Bed: {metrics?.slideDownDetected ? 'SLID DOWN' : 'OK'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="rounded-lg bg-sky-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-sky-500"
          >
            Expand
          </button>
        </div>
      )}
    </div>
  );
};
