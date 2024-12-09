import React, { useState, useEffect, useRef, useCallback } from "react";
import liff from "@line/liff";
import "./App.css";

function App() {
  const canvasRef = useRef(null);
  const [basketPosition, setBasketPosition] = useState(50);
  const [score, setScore] = useState(0);
  const [missedFruits, setMissedFruits] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const fruits = useRef([]);
  const fruitCounter = useRef(0);

  useEffect(() => {
    liff.init({ liffId: import.meta.env.VITE_LIFF_ID }).catch(console.error);
  }, []);

  const generateFruit = () => {
    const fruitTypes = [
      { color: "red", size: 20, points: 1 },
      { color: "yellow", size: 30, points: 2 },
      { color: "green", size: 40, points: 3 },
    ];
    const randomFruit =
      fruitTypes[Math.floor(Math.random() * fruitTypes.length)];

    fruits.current.push({
      id: fruitCounter.current++,
      x: Math.random() * 90,
      y: 0,
      speed: 0.5 + Math.random() * 1, // 落下速度を調整
      ...randomFruit,
    });
  };

  const updateGame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Canvas をクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // バスケットを描画
    const basketWidth = 50;
    const basketHeight = 20;
    ctx.fillStyle = "blue";
    ctx.fillRect(
      (basketPosition / 100) * canvas.width - basketWidth / 2,
      canvas.height - basketHeight,
      basketWidth,
      basketHeight
    );

    // フルーツを更新＆描画
    const updatedFruits = [];
    fruits.current.forEach((fruit) => {
      fruit.y += fruit.speed;

      ctx.beginPath();
      ctx.arc(
        (fruit.x / 100) * canvas.width,
        (fruit.y / 100) * canvas.height,
        fruit.size,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = fruit.color;
      ctx.fill();

      const basketLeft = (basketPosition / 100) * canvas.width - basketWidth / 2;
      const basketRight = basketLeft + basketWidth;
      const basketTop = canvas.height - basketHeight;

      if (
        fruit.y / 100 * canvas.height > basketTop &&
        (fruit.x / 100) * canvas.width > basketLeft &&
        (fruit.x / 100) * canvas.width < basketRight
      ) {
        setScore((prev) => prev + fruit.points);
      } else if (fruit.y < 100) {
        updatedFruits.push(fruit);
      } else {
        setMissedFruits((prev) => prev + 1);
      }
    });
    fruits.current = updatedFruits;
  };

  useEffect(() => {
    if (gameOver) return;

    const fruitInterval = setInterval(() => {
      generateFruit();
    }, 2000); // フルーツ生成間隔を 3 秒に設定

    const gameInterval = setInterval(() => {
      updateGame();
    }, 50);

    return () => {
      clearInterval(fruitInterval);
      clearInterval(gameInterval);
    };
  }, [gameOver, basketPosition]);

  useEffect(() => {
    if (missedFruits >= 5) {
      setGameOver(true);
    }
  }, [missedFruits]);

  const handleWindowClick = useCallback((event) => {
    const clickX = event.clientX;
    const windowWidth = window.innerWidth;

    if (clickX < windowWidth / 2) {
      setBasketPosition((pos) => Math.max(0, pos - 5));
    } else {
      setBasketPosition((pos) => Math.min(100, pos + 5));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleWindowClick);
    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, [handleWindowClick]);

  const handleRestart = () => {
    setScore(0);
    setMissedFruits(0);
    setGameOver(false);
    fruits.current = [];
    fruitCounter.current = 0;
  };

  if (gameOver) {
    return (
      <div className="game-over">
        <h1>ゲームオーバー</h1>
        <p>スコア: {score}</p>
        <button onClick={handleRestart}>再開</button>
      </div>
    );
  }

  return (
    <div className="game-container">
      <canvas ref={canvasRef} width={800} height={600}></canvas>
      <p>スコア: {score}</p>
      <p>ミス: {missedFruits}/5</p>
    </div>
  );
}

export default App;
