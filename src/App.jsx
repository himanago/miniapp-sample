import React, { useState, useEffect, useRef, useCallback } from "react";
import liff from "@line/liff";
import "./App.css";

const fruitTypes = [
  { name: "apple", color: "red", size: 30, score: 1 },
  { name: "banana", color: "yellow", size: 40, score: 2 },
  { name: "grape", color: "purple", size: 20, score: 3 },
];

function App() {
  const [basketPosition, setBasketPosition] = useState(50); // バスケットのX位置（%）
  const [fruits, setFruits] = useState([]); // 落ちてくるフルーツ
  const [score, setScore] = useState(0); // スコア
  const [missedFruits, setMissedFruits] = useState(0); // 落としたフルーツの数
  const [gameOver, setGameOver] = useState(false); // ゲームオーバー判定
  const fruitCounter = useRef(0); // フルーツIDを管理

  useEffect(() => {
    liff
      .init({
        liffId: import.meta.env.VITE_LIFF_ID,
      })
      .then(() => {
        console.log("LIFF init succeeded.");
      })
      .catch((e) => {
        console.error("LIFF init failed.", e);
      });
  }, []);

  useEffect(() => {
    if (gameOver) return;

    // フルーツ生成のインターバル
    const fruitInterval = setInterval(() => {
      const randomFruit =
        fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
      setFruits((prev) => [
        ...prev,
        {
          id: fruitCounter.current++,
          x: Math.random() * 90,
          y: 0,
          type: randomFruit,
        },
      ]);
    }, 3000);

    // フルーツ落下処理
    const dropInterval = setInterval(() => {
      setFruits((prev) =>
        prev.map((fruit) => ({
          ...fruit,
          y: fruit.y + 1.5, // 落下速度
        }))
      );
    }, 50);

    return () => {
      clearInterval(fruitInterval);
      clearInterval(dropInterval);
    };
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const newFruits = [];
    let missedCount = 0;

    // 衝突判定と落としたフルーツのカウント
    fruits.forEach((fruit) => {
      const basketWidth = 10; // バスケットの幅（%）
      if (
        fruit.y >= 90 && // フルーツがバスケットの高さ付近
        fruit.x > basketPosition - basketWidth / 2 &&
        fruit.x < basketPosition + basketWidth / 2
      ) {
        setScore((s) => s + fruit.type.score); // スコア加算
      } else if (fruit.y > 100) {
        missedCount++; // 画面外に出たフルーツをカウント
      } else {
        newFruits.push(fruit); // 残すフルーツ
      }
    });

    setFruits(newFruits);
    if (missedCount > 0) {
      setMissedFruits((prev) => prev + missedCount);
    }

    // ゲームオーバー判定
    if (missedFruits + missedCount >= 5) {
      setGameOver(true);
    }
  }, [fruits, basketPosition, missedFruits, gameOver]);

  // クリック操作でバスケットを移動
  const handleWindowClick = useCallback(
    (event) => {
      if (gameOver) return;

      const clickX = event.clientX;
      const windowWidth = window.innerWidth;

      if (clickX < windowWidth / 2) {
        // 左クリック
        setBasketPosition((pos) => Math.max(0, pos - 5));
      } else {
        // 右クリック
        setBasketPosition((pos) => Math.min(90, pos + 5));
      }
    },
    [gameOver]
  );

  useEffect(() => {
    window.addEventListener("click", handleWindowClick);
    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, [handleWindowClick]);

  return (
    <div className="game-container">
      <h1>🍎 フルーツキャッチゲーム 🍇</h1>
      {gameOver ? (
        <div className="game-over">
          <h2>ゲームオーバー</h2>
          <p>最終スコア: {score}</p>
        </div>
      ) : (
        <>
          <p>スコア: {score}</p>
          <p>落としたフルーツ: {missedFruits} / 5</p>
          <div className="basket" style={{ left: `${basketPosition}%` }}></div>
          {fruits.map((fruit) => (
            <div
              key={fruit.id}
              className="fruit"
              style={{
                left: `${fruit.x}%`,
                top: `${fruit.y}%`,
                backgroundColor: fruit.type.color,
                width: `${fruit.type.size}px`,
                height: `${fruit.type.size}px`,
              }}
            ></div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;
