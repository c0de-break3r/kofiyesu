import { useEffect, useRef } from "react";

interface ThreeSceneProps {
  className?: string;
}

export function ThreeScene({ className = "" }: ThreeSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const init = () => {
      if (cancelled || !canvasRef.current || initialized.current) return;
      void import("@/three").then(({ three }) => {
        if (cancelled || !canvasRef.current || initialized.current) return;
        three.init(canvasRef.current);
        initialized.current = true;
      });
    };

    void import("@/utils/resources").then(({ resources }) => {
      if (cancelled) return;

      const scheduleInit = () => {
        if (typeof requestIdleCallback === "function") {
          requestIdleCallback(init, { timeout: 500 });
        } else {
          window.setTimeout(init, 50);
        }
      };

      if (resources.isReady) scheduleInit();
      else resources.once("ready", scheduleInit);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      initialized.current = false;
      void import("@/three").then(({ three }) => three.destroy());
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden
    />
  );
}
