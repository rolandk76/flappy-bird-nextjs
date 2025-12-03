'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Bird {
  y: number;
  velocity: number;
}

interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

const GRAVITY = 0.5;
const JUMP_FORCE = -9;
const PIPE_SPEED = 3;
const PIPE_WIDTH = 80;
const PIPE_GAP = 180;
const BIRD_SIZE = 40;
const BIRD_X = 100;

export default function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const birdRef = useRef<Bird>({ y: 250, velocity: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const frameRef = useRef<number>(0);
  const scoreRef = useRef(0);

  const resetGame = useCallback(() => {
    birdRef.current = { y: 250, velocity: 0 };
    pipesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
  }, []);

  const jump = useCallback(() => {
    if (gameState === 'idle') {
      resetGame();
      setGameState('playing');
    } else if (gameState === 'playing') {
      birdRef.current.velocity = JUMP_FORCE;
    } else if (gameState === 'gameover') {
      resetGame();
      setGameState('playing');
    }
  }, [gameState, resetGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  useEffect(() => {
    const saved = localStorage.getItem('flappyHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const drawBird = (y: number, frame: number) => {
      const wingOffset = Math.sin(frame * 0.3) * 5;
      
      // Body gradient
      const gradient = ctx.createRadialGradient(
        BIRD_X, y, 5,
        BIRD_X, y, BIRD_SIZE / 2
      );
      gradient.addColorStop(0, '#FFE066');
      gradient.addColorStop(1, '#F59E0B');
      
      // Shadow
      ctx.beginPath();
      ctx.ellipse(BIRD_X + 3, y + 3, BIRD_SIZE / 2, BIRD_SIZE / 2.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fill();
      
      // Body
      ctx.beginPath();
      ctx.ellipse(BIRD_X, y, BIRD_SIZE / 2, BIRD_SIZE / 2.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Wing
      ctx.beginPath();
      ctx.ellipse(BIRD_X - 5, y + wingOffset, 12, 8, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#FCD34D';
      ctx.fill();
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Eye white
      ctx.beginPath();
      ctx.arc(BIRD_X + 10, y - 5, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Eye pupil
      ctx.beginPath();
      ctx.arc(BIRD_X + 12, y - 5, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#1F2937';
      ctx.fill();
      
      // Eye highlight
      ctx.beginPath();
      ctx.arc(BIRD_X + 14, y - 7, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      
      // Beak
      ctx.beginPath();
      ctx.moveTo(BIRD_X + 18, y);
      ctx.lineTo(BIRD_X + 30, y + 3);
      ctx.lineTo(BIRD_X + 18, y + 8);
      ctx.closePath();
      ctx.fillStyle = '#EF4444';
      ctx.fill();
      ctx.strokeStyle = '#B91C1C';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const drawPipe = (x: number, topHeight: number) => {
      const bottomY = topHeight + PIPE_GAP;
      const canvasHeight = canvas.height;
      
      // Top pipe
      const topGradient = ctx.createLinearGradient(x, 0, x + PIPE_WIDTH, 0);
      topGradient.addColorStop(0, '#059669');
      topGradient.addColorStop(0.5, '#10B981');
      topGradient.addColorStop(1, '#059669');
      
      ctx.fillStyle = topGradient;
      ctx.fillRect(x, 0, PIPE_WIDTH, topHeight);
      
      // Top pipe cap
      ctx.fillStyle = '#047857';
      ctx.fillRect(x - 5, topHeight - 30, PIPE_WIDTH + 10, 30);
      
      // Top pipe highlight
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(x + 5, 0, 10, topHeight - 30);
      
      // Bottom pipe
      ctx.fillStyle = topGradient;
      ctx.fillRect(x, bottomY, PIPE_WIDTH, canvasHeight - bottomY);
      
      // Bottom pipe cap
      ctx.fillStyle = '#047857';
      ctx.fillRect(x - 5, bottomY, PIPE_WIDTH + 10, 30);
      
      // Bottom pipe highlight
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(x + 5, bottomY + 30, 10, canvasHeight - bottomY - 30);
      
      // Pipe borders
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, 0, PIPE_WIDTH, topHeight);
      ctx.strokeRect(x, bottomY, PIPE_WIDTH, canvasHeight - bottomY);
    };

    const drawBackground = (frame: number) => {
      // Sky gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, '#0EA5E9');
      skyGradient.addColorStop(0.5, '#38BDF8');
      skyGradient.addColorStop(1, '#7DD3FC');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Clouds
      const drawCloud = (x: number, y: number, scale: number) => {
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.arc(x, y, 30 * scale, 0, Math.PI * 2);
        ctx.arc(x + 25 * scale, y - 10 * scale, 25 * scale, 0, Math.PI * 2);
        ctx.arc(x + 50 * scale, y, 30 * scale, 0, Math.PI * 2);
        ctx.arc(x + 25 * scale, y + 10 * scale, 20 * scale, 0, Math.PI * 2);
        ctx.fill();
      };
      
      const cloudOffset = (frame * 0.5) % (canvas.width + 200);
      drawCloud(canvas.width - cloudOffset, 80, 1);
      drawCloud(canvas.width - cloudOffset + 300, 120, 0.8);
      drawCloud(canvas.width - cloudOffset + 500, 60, 1.2);
      
      // Ground
      const groundGradient = ctx.createLinearGradient(0, canvas.height - 80, 0, canvas.height);
      groundGradient.addColorStop(0, '#84CC16');
      groundGradient.addColorStop(0.3, '#65A30D');
      groundGradient.addColorStop(1, '#4D7C0F');
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
      
      // Ground pattern
      ctx.fillStyle = '#65A30D';
      for (let i = 0; i < canvas.width; i += 40) {
        const offset = (frame * 2 + i) % (canvas.width + 40);
        ctx.beginPath();
        ctx.moveTo(canvas.width - offset, canvas.height - 80);
        ctx.lineTo(canvas.width - offset + 20, canvas.height - 60);
        ctx.lineTo(canvas.width - offset + 40, canvas.height - 80);
        ctx.fill();
      }
    };

    const checkCollision = (bird: Bird, pipes: Pipe[]): boolean => {
      // Ground collision
      if (bird.y + BIRD_SIZE / 2 > canvas.height - 80 || bird.y - BIRD_SIZE / 2 < 0) {
        return true;
      }
      
      // Pipe collision
      for (const pipe of pipes) {
        if (
          BIRD_X + BIRD_SIZE / 2 > pipe.x &&
          BIRD_X - BIRD_SIZE / 2 < pipe.x + PIPE_WIDTH
        ) {
          if (
            bird.y - BIRD_SIZE / 2.5 < pipe.topHeight ||
            bird.y + BIRD_SIZE / 2.5 > pipe.topHeight + PIPE_GAP
          ) {
            return true;
          }
        }
      }
      
      return false;
    };

    const gameLoop = () => {
      frameRef.current++;
      const frame = frameRef.current;
      
      // Clear and draw background
      drawBackground(frame);
      
      if (gameState === 'playing') {
        // Update bird
        birdRef.current.velocity += GRAVITY;
        birdRef.current.y += birdRef.current.velocity;
        
        // Update pipes
        if (frame % 100 === 0) {
          const minHeight = 80;
          const maxHeight = canvas.height - PIPE_GAP - 160;
          const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
          pipesRef.current.push({ x: canvas.width, topHeight, passed: false });
        }
        
        pipesRef.current = pipesRef.current.filter(pipe => pipe.x > -PIPE_WIDTH);
        
        pipesRef.current.forEach(pipe => {
          pipe.x -= PIPE_SPEED;
          
          // Score
          if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
            pipe.passed = true;
            scoreRef.current++;
            setScore(scoreRef.current);
          }
        });
        
        // Check collision
        if (checkCollision(birdRef.current, pipesRef.current)) {
          setGameState('gameover');
          if (scoreRef.current > highScore) {
            setHighScore(scoreRef.current);
            localStorage.setItem('flappyHighScore', scoreRef.current.toString());
          }
        }
      }
      
      // Draw pipes
      pipesRef.current.forEach(pipe => drawPipe(pipe.x, pipe.topHeight));
      
      // Draw bird
      drawBird(birdRef.current.y, frame);
      
      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => cancelAnimationFrame(animationId);
  }, [gameState, highScore]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={600}
        height={500}
        onClick={jump}
        className="rounded-2xl shadow-2xl cursor-pointer border-4 border-white/20"
      />
      
      {/* Score Display */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <div className="text-5xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          {score}
        </div>
      </div>
      
      {/* Idle Screen */}
      {gameState === 'idle' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 rounded-2xl backdrop-blur-sm">
          <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
            🐦 Flappy Bird
          </h2>
          <p className="text-white/90 text-lg mb-6">
            Klicke oder drücke Leertaste zum Starten
          </p>
          <div className="animate-bounce">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-2xl backdrop-blur-sm">
          <h2 className="text-4xl font-bold text-red-400 mb-2 drop-shadow-lg">
            Game Over!
          </h2>
          <div className="bg-white/20 rounded-xl p-6 mb-6 backdrop-blur">
            <p className="text-white text-2xl mb-2">
              Score: <span className="font-bold text-yellow-300">{score}</span>
            </p>
            <p className="text-white/80 text-lg">
              Highscore: <span className="font-bold text-green-300">{highScore}</span>
            </p>
          </div>
          <button
            onClick={jump}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full text-lg shadow-lg hover:scale-105 transition-transform active:scale-95"
          >
            Nochmal spielen
          </button>
        </div>
      )}
      
      {/* High Score Badge */}
      {highScore > 0 && gameState !== 'gameover' && (
        <div className="absolute top-4 right-4 bg-yellow-500/90 px-3 py-1 rounded-full">
          <span className="text-white font-bold text-sm">🏆 {highScore}</span>
        </div>
      )}
    </div>
  );
}
