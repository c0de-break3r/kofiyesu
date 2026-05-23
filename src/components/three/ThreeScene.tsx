import { useEffect, useRef } from "react";

interface ThreeSceneProps {
  className?: string;
}

export function ThreeScene({ className = "" }: ThreeSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || initialized.current) return;

    const init = () => {
      if (!canvasRef.current || initialized.current) return;
      void import("@/three").then(({ three }) => {
        if (!canvasRef.current || initialized.current) return;
        three.init(canvasRef.current);
        initialized.current = true;
      });
    };

    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(init, { timeout: 2000 });
    } else {
      window.setTimeout(init, 100);
    }
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
