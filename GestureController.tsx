import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

interface GestureControllerProps {
  onUpdate: (data: { chaos: number; x: number; y: number; detected: boolean }) => void;
}

const GestureController: React.FC<GestureControllerProps> = ({ onUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);

  useEffect(() => {
    let isMounted = true;

    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        if (!isMounted) return;

        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        if (isMounted) startWebcam();
      } catch (err) {
        console.error("Failed to init MediaPipe", err);
        if (isMounted) {
            setError("Could not initialize Gesture Recognition. Please ensure WebGL is enabled.");
            setLoading(false);
        }
      }
    };

    initMediaPipe();

    return () => {
      isMounted = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
      if (landmarkerRef.current) {
          landmarkerRef.current.close();
      }
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
            predictWebcam();
        };
      }
      setLoading(false);
    } catch (err) {
      console.error("Webcam error", err);
      setError("Camera access denied. Please allow camera access to interact.");
      setLoading(false);
    }
  };

  const predictWebcam = () => {
    requestRef.current = requestAnimationFrame(predictWebcam);

    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (!landmarker || !video || video.readyState < 2) return;

    // Optimization: Only run detection if the video frame has changed
    if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        
        const nowInMs = Date.now();
        const results = landmarker.detectForVideo(video, nowInMs);

        let chaosTarget = 0;
        let handX = 0;
        let handY = 0;
        let detected = false;

        if (results.landmarks.length > 0) {
            detected = true;
            const landmarks = results.landmarks[0];
            
            const wrist = landmarks[0];
            const middleFingerMCP = landmarks[9];
            handX = (wrist.x + middleFingerMCP.x) / 2;
            handY = (wrist.y + middleFingerMCP.y) / 2;

            handX = (handX - 0.5) * 2;
            handY = (handY - 0.5) * 2;

            const fingerTips = [4, 8, 12, 16, 20];
            let totalDist = 0;
            fingerTips.forEach(idx => {
                const dx = landmarks[idx].x - wrist.x;
                const dy = landmarks[idx].y - wrist.y;
                totalDist += Math.sqrt(dx*dx + dy*dy);
            });
            const avgDist = totalDist / 5;

            if (avgDist > 0.3) {
                chaosTarget = 1; // Open hand
            } else {
                chaosTarget = 0; // Closed hand
            }
        }
        
        onUpdate({ chaos: chaosTarget, x: handX, y: handY, detected });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 opacity-80 hover:opacity-100 transition-opacity pointer-events-none">
      <div className="relative w-32 h-24 bg-black/50 border border-[#cfc09f] rounded overflow-hidden shadow-lg backdrop-blur-sm pointer-events-auto">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover transform scale-x-[-1]" 
          autoPlay 
          playsInline 
          muted 
        />
        {loading && <div className="absolute inset-0 flex items-center justify-center text-xs text-[#cfc09f] font-serif">Loading AI...</div>}
        {error && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-red-400 p-1 text-center bg-black/80">{error}</div>}
      </div>
      <div className="text-[10px] text-[#cfc09f] text-center mt-1 font-serif uppercase tracking-widest">
        Camera Feed
      </div>
    </div>
  );
};

export default GestureController;