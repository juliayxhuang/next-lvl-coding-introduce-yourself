import React, { useEffect, useRef, useState } from 'react';
import { WiggleBox } from './WiggleBox';

const DISCO_LIGHTS = ['rgba(255, 0, 191, .9)', 'rgba(0, 225, 255, .9)', 'rgba(255, 233, 0, .8)'];

export const PartyPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    let active = true;
    let stream: MediaStream | null = null;
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(true);
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((mediaStream) => {
        if (!active) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = mediaStream;
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      })
      .catch(() => { if (active) setCameraError(true); });
    return () => {
      active = false;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="w-full max-w-[1120px] grid grid-cols-1 lg:grid-cols-3 gap-4 h-[54vh] max-h-[440px]">
      <div className="lg:col-span-2 min-h-0">
        <WiggleBox className="w-full h-full" borderRadius={16} strokeWidth={2.75} borderOnTop>
          <div className="relative w-full h-full overflow-hidden rounded-2xl flex items-center justify-center">
            {cameraError ? (
              <p className="text-[18pt] uppercase text-center px-6">CAMERA UNAVAILABLE. ALLOW WEBCAM ACCESS TO JOIN THE PARTY.</p>
            ) : (
              <>
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover -scale-x-100" style={{ filter: 'saturate(2.1) contrast(1.12)' }} />
                <div className="party-color-wash is-playing" style={{ background: 'linear-gradient(125deg, rgba(255, 0, 183, .25), rgba(0, 227, 255, .25), rgba(255, 232, 35, .2))' }} aria-hidden="true" />
                {DISCO_LIGHTS.map((color, index) => (
                  <div
                    key={index}
                    className={`party-light party-light-${index + 1} is-playing`}
                    style={{ background: `radial-gradient(ellipse, ${color} 0%, transparent 68%)` }}
                    aria-hidden="true"
                  />
                ))}
              </>
            )}
          </div>
        </WiggleBox>
      </div>
      <WiggleBox className="min-h-0" borderRadius={16} strokeWidth={2.75} borderOnTop>
        <iframe
          title="Julia's Spotify playlist"
          src="https://open.spotify.com/embed/playlist/78WYX0TFy5zBUrVsbL1021"
          className="block w-full h-full rounded-2xl border-0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
      </WiggleBox>
    </div>
  );
};
