import { useEffect, useRef } from "react";

interface ThreeSceneProps {
  visible?: boolean;
  className?: string;
}

export function ThreeScene({ visible = true, className = "" }: ThreeSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!visible || !canvasRef.current || initialized.current) return;

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
  }, [visible]);

  useEffect(() => {
    if (visible) return;
    void import("@/three/core/renderer").then(({ renderer }) => renderer.setIsActive(false));
  }, [visible]);

  useEffect(() => {
    return () => {
      initialized.current = false;
      void import("@/three").then(({ three }) => three.destroy());
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"} ${className}`}
      aria-hidden
    />
  );
}
