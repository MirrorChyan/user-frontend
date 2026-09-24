"use client";
import { cn } from "@/lib/utils/css";
import React, { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

type BeamOptions = {
  initialX: number;
  duration: number;
  repeatDelay: number;
  delay?: number;
  // 高度需要与 className 中的 h-* 保持一致，用于计算碰撞时间
  height: number;
  className: string;
};

const BEAMS: BeamOptions[] = [
  { initialX: 10, duration: 7, repeatDelay: 3, delay: 2, height: 56, className: "h-14" },
  { initialX: 600, duration: 3, repeatDelay: 3, delay: 4, height: 56, className: "h-14" },
  { initialX: 100, duration: 7, repeatDelay: 7, height: 24, className: "h-6" },
  { initialX: 400, duration: 5, repeatDelay: 14, delay: 4, height: 56, className: "h-14" },
  { initialX: 800, duration: 11, repeatDelay: 2, height: 80, className: "h-20" },
  { initialX: 1000, duration: 4, repeatDelay: 2, height: 48, className: "h-12" },
  { initialX: 1200, duration: 6, repeatDelay: 4, delay: 2, height: 24, className: "h-6" },
];

// 光束位于 top-20（80px），从 translateY(-200px) 线性移动到 translateY(1800px)
const BEAM_TOP = 80;
const START_Y = -200;
const END_Y = 1800;
const EXPLOSION_MS = 2000;

type Particle = { id: number; x: number; y: number; duration: number };
type ExplosionState = { x: number; y: number; particles: Particle[] };

function createParticles(): Particle[] {
  return Array.from({ length: 20 }, (_, index) => ({
    id: index,
    x: Math.floor(Math.random() * 80 - 40),
    y: Math.floor(Math.random() * -50 - 10),
    duration: Math.random() * 1.5 + 0.5,
  }));
}

export const BackgroundBeamsWithCollision = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;
    const observer = new ResizeObserver(() => {
      setSize({ width: parent.clientWidth, height: parent.clientHeight });
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  // 只渲染落在容器宽度内的光束，窄屏上不再为看不见的光束做动画
  const beams = size && !reducedMotion ? BEAMS.filter(beam => beam.initialX < size.width) : [];

  return (
    <div
      ref={parentRef}
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden bg-gradient-to-b from-white to-neutral-100 dark:from-neutral-950 dark:to-neutral-800",
        // h-screen if you want bigger
        className
      )}
    >
      {size &&
        beams.map(beam => (
          <CollisionBeam key={beam.initialX} beam={beam} parentHeight={size.height} />
        ))}

      {children}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 w-full bg-neutral-100"
        style={{
          boxShadow:
            "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset",
        }}
      ></div>
    </div>
  );
};

/**
 * 光束匀速下落，根据容器高度直接算出落到底部的时刻，不再轮询位置。
 * 碰撞后展示爆炸效果并在 2 秒后重新下落（再次等待 delay）；
 * 容器过高碰不到底部时，落完一轮后等待 repeatDelay 再开始下一轮。
 */
function CollisionBeam({ beam, parentHeight }: { beam: BeamOptions; parentHeight: number }) {
  const [round, setRound] = useState({ id: 0, delay: beam.delay ?? 0 });
  const [explosion, setExplosion] = useState<ExplosionState | null>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const travel = parentHeight - BEAM_TOP - beam.height - START_Y;
    const reachesBottom = travel > 0 && travel <= END_Y - START_Y;

    if (reachesBottom) {
      const hitAt = round.delay + (travel / (END_Y - START_Y)) * beam.duration;
      timers.push(
        setTimeout(() => {
          setExplosion({ x: beam.initialX, y: parentHeight, particles: createParticles() });
          timers.push(
            setTimeout(() => {
              setExplosion(null);
              setRound(prev => ({ id: prev.id + 1, delay: beam.delay ?? 0 }));
            }, EXPLOSION_MS)
          );
        }, hitAt * 1000)
      );
    } else {
      timers.push(
        setTimeout(
          () => setRound(prev => ({ id: prev.id + 1, delay: beam.repeatDelay })),
          (round.delay + beam.duration) * 1000
        )
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [beam, parentHeight, round]);

  return (
    <>
      <div
        key={round.id}
        className={cn(
          "collision-beam absolute top-20 left-0 w-px rounded-full bg-gradient-to-t from-indigo-500 via-purple-500 to-transparent",
          beam.className
        )}
        style={
          {
            "--beam-x": `${beam.initialX}px`,
            animationDuration: `${beam.duration}s`,
            animationDelay: `${round.delay}s`,
          } as React.CSSProperties
        }
      />
      {explosion && <Explosion {...explosion} />}
    </>
  );
}

function Explosion({ x, y, particles }: ExplosionState) {
  return (
    <div
      className="absolute z-50 h-2 w-2"
      style={{ left: `${x}px`, top: `${y}px`, transform: "translate(-50%, -50%)" }}
    >
      <div className="explosion-flash absolute -inset-x-10 top-0 m-auto h-2 w-10 rounded-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
      {particles.map(particle => (
        <span
          key={particle.id}
          className="explosion-particle absolute h-1 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"
          style={
            {
              "--particle-x": `${particle.x}px`,
              "--particle-y": `${particle.y}px`,
              animationDuration: `${particle.duration}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
