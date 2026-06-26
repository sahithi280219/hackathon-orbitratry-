import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
}

export default function StarfieldBg() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Create stars with varying 3D depth
    const starCount = 1500;
    const stars: Star[] = [];

    const colors = [
      "rgba(255, 255, 255, 0.9)", // White
      "rgba(135, 206, 250, 0.8)", // Light blue
      "rgba(255, 223, 196, 0.8)", // Warm white/yellow
      "rgba(0, 255, 204, 0.6)",   // Cyan
      "rgba(123, 95, 255, 0.6)",  // Purple
    ];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * 1000 + 100, // Depth
        size: Math.random() * 1.5 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse to -0.5 to 0.5 range
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 50;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 50;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    const render = () => {
      // Smooth interpolation for mouse parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Dark space background gradient
      ctx.fillStyle = "#050A1A";
      ctx.fillRect(0, 0, width, height);

      // Add a subtle radial glow in the center
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        width
      );
      gradient.addColorStop(0, "rgba(5, 10, 26, 1)");
      gradient.addColorStop(0.5, "rgba(12, 10, 36, 0.95)");
      gradient.addColorStop(1, "rgba(2, 4, 12, 1)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw stars and project them in 3D
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Move stars slowly toward viewer (flight simulation)
        star.z -= 0.15;
        if (star.z <= 0) {
          star.z = 1000;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        // Apply 3D perspective projection
        const fov = 400;
        const scale = fov / star.z;
        const starX = star.x * scale + centerX - mouseRef.current.x * (scale * 0.3);
        const starY = star.y * scale + centerY - mouseRef.current.y * (scale * 0.3);

        // Render only if within viewport bounds
        if (starX >= 0 && starX <= width && starY >= 0 && starY <= height) {
          // Adjust opacity based on distance to feel realistic
          const opacity = Math.min(1, Math.max(0.1, (1000 - star.z) / 900));
          ctx.beginPath();
          ctx.arc(starX, starY, star.size * scale * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = star.color.replace(/[\d.]+\)$/, `${opacity})`);
          ctx.fill();

          // Render a faint neon glow for larger stars close to the viewport
          if (star.size > 1.2 && star.z < 300) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = star.color;
            ctx.arc(starX, starY, star.size * scale * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            ctx.fill();
            ctx.shadowBlur = 0; // reset
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      id="orbitra-starfield-canvas"
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
    />
  );
}
