'use client';

import React, { useEffect } from 'react';

interface StravaRouteEmbedProps {
  routeId: string;
}

export function StravaRouteEmbed({ routeId }: StravaRouteEmbedProps) {
  useEffect(() => {
    // If the bootstrap function is already available, execute it to find the new placeholder.
    if (typeof window !== 'undefined' && (window as any).__STRAVA_EMBED_BOOTSTRAP__) {
      (window as any).__STRAVA_EMBED_BOOTSTRAP__();
      return;
    }

    // Otherwise, load the script. When it loads, it will define the bootstrap function and auto-run.
    const scriptId = 'strava-embed-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.src = 'https://strava-embeds.com/embed.js';
      script.id = scriptId;
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Script is already in DOM but bootstrap might not be set yet (e.g. loading).
      // We can hook to its 'load' event to make sure bootstrap runs.
      const handleLoad = () => {
        if ((window as any).__STRAVA_EMBED_BOOTSTRAP__) {
          (window as any).__STRAVA_EMBED_BOOTSTRAP__();
        }
      };
      script.addEventListener('load', handleLoad);
      return () => {
        script.removeEventListener('load', handleLoad);
      };
    }
  }, [routeId]);

  return (
    <div className="w-full flex justify-center bg-black/20 rounded-none overflow-hidden border border-white/5 shadow-inner min-h-[650px]">
      <div
        className="strava-embed-placeholder w-full h-[650px]"
        data-embed-type="route"
        data-embed-id={routeId}
        data-full-width="true"
        data-style="standard"
        data-terrain="3d"
        data-from-embed="false"
      />
    </div>
  );
}
