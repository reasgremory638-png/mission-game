import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Island.css';

interface IslandProps {
  completionPercentage: number;
  missedDaysCount: number;
  totalDays: number;
}

export const Island: React.FC<IslandProps> = ({
  completionPercentage,
  missedDaysCount,
  totalDays,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    skyGradient.addColorStop(
      0,
      `rgba(15, 23, 42, ${0.5 + completionPercentage * 0.5})`
    );
    skyGradient.addColorStop(
      0.5,
      `rgba(55, 65, 81, ${0.3 + completionPercentage * 0.4})`
    );
    skyGradient.addColorStop(1, 'rgba(30, 41, 59, 0.2)');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);

    // Draw water
    ctx.fillStyle = 'rgba(30, 144, 255, 0.2)';
    ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

    // Draw island
    const islandCenterX = canvas.width / 2;
    const islandCenterY = canvas.height * 0.65;
    const baseIslandSize = 150;
    const islandSize = baseIslandSize + completionPercentage * 30;

    // Island gradient
    const islandGradient = ctx.createRadialGradient(
      islandCenterX,
      islandCenterY,
      0,
      islandCenterX,
      islandCenterY,
      islandSize
    );
    islandGradient.addColorStop(0, '#16a34a');
    islandGradient.addColorStop(0.7, '#15803d');
    islandGradient.addColorStop(1, '#166534');

    ctx.fillStyle = islandGradient;
    ctx.beginPath();
    ctx.ellipse(islandCenterX, islandCenterY, islandSize, islandSize * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw trees based on completion
    const treeCount = Math.floor(completionPercentage * 8);
    for (let i = 0; i < treeCount; i++) {
      const angle = (i / Math.max(treeCount, 1)) * Math.PI * 2;
      const distance = islandSize * 0.5;
      const treeX = islandCenterX + Math.cos(angle) * distance;
      const treeY = islandCenterY + Math.sin(angle) * distance;

      // Trunk
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(treeX - 8, treeY, 16, 30);

      // Foliage
      ctx.fillStyle = `rgba(22, 163, 74, ${0.7 + completionPercentage * 0.3})`;
      ctx.beginPath();
      ctx.arc(treeX, treeY - 15, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(20, 184, 82, ${0.6 + completionPercentage * 0.4})`;
      ctx.beginPath();
      ctx.arc(treeX - 10, treeY - 5, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(treeX + 10, treeY - 5, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw central structure
    if (completionPercentage > 0.3) {
      // House
      ctx.fillStyle = '#d97706';
      ctx.fillRect(islandCenterX - 40, islandCenterY - 50, 80, 60);

      // Roof
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.moveTo(islandCenterX - 40, islandCenterY - 50);
      ctx.lineTo(islandCenterX, islandCenterY - 90);
      ctx.lineTo(islandCenterX + 40, islandCenterY - 50);
      ctx.fill();

      // Door
      ctx.fillStyle = '#3f2e19';
      ctx.fillRect(islandCenterX - 15, islandCenterY - 10, 30, 40);

      // Window
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(islandCenterX - 30, islandCenterY - 35, 15, 15);
      ctx.fillRect(islandCenterX + 15, islandCenterY - 35, 15, 15);
    }

    // Draw sun/moon based on progress
    const sunX = canvas.width * (0.2 + completionPercentage * 0.6);
    const sunY = canvas.height * (0.15 + (1 - completionPercentage) * 0.2);

    const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 40);
    sunGradient.addColorStop(0, `rgba(255, 193, 7, ${completionPercentage * 0.8})`);
    sunGradient.addColorStop(1, `rgba(255, 152, 0, ${completionPercentage * 0.4})`);
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
    ctx.fill();

    // Draw progress indicator circles
    const circleRadius = 8;
    const circleSpacing = 20;
    const startX = canvas.width * 0.1;

    for (let i = 0; i < totalDays; i++) {
      const x = startX + i * circleSpacing;
      const completed = (i / totalDays) * 100 <= completionPercentage;

      ctx.fillStyle = completed ? '#10b981' : 'rgba(148, 163, 184, 0.3)';
      ctx.beginPath();
      ctx.arc(x, canvas.height - 30, circleRadius, 0, Math.PI * 2);
      ctx.fill();

      if (completed) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', x, canvas.height - 30);
      }
    }
  }, [completionPercentage, missedDaysCount, totalDays]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="island-container"
    >
      <canvas ref={canvasRef} className="island-canvas" />
      <div className="island-stats">
        <div className="stat">
          <span className="stat-label">Progress</span>
          <span className="stat-value">{Math.round(completionPercentage)}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">Completed</span>
          <span className="stat-value">
            {Math.floor((completionPercentage / 100) * totalDays)}/{totalDays}
          </span>
        </div>
        {missedDaysCount > 0 && (
          <div className="stat stat-warning">
            <span className="stat-label">Missed</span>
            <span className="stat-value">{missedDaysCount}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
