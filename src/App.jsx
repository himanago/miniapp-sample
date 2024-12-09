import React, { useState, useEffect, useRef, useCallback } from 'react';
import liff from "@line/liff";
import "./App.css";

function App() {
  const [basketPosition, setBasketPosition] = useState(50); // バスケットのX位置（%）
  const [fruits, setFruits] = useState([]); // 落ちてくるフルーツ
  const [score, setScore] = useState(0); // スコア
  const fruitCounter = useRef(0); // フルーツIDを管理

  useEffect(() => {
    liff
      .init({
        liffId: import.meta.env.VITE_LIFF_ID
      })
      .then(() => {
        setMessage("LIFF init succeeded.");
        liff.getProfile()
          .then((profile) => {
            setName(profile.displayName);
          })
          .catch((err) => {
            console.log("error", err);
          });
      })
      .catch((e) => {
        setMessage("LIFF init failed.");
        setError(`${e}`);
      });
  });

  useEffect(() => {
    // フルーツ生成のインターバル
    const fruitInterval = setInterval(() => {
      setFruits((prev) => [
        ...prev,
        { id: fruitCounter.current++, x: Math.random() * 90, y: 0 },
      ]);
    }, 1000);

    // フルーツ落下処理
    const dropInterval = setInterval(() => {
      setFruits((prev) =>
        prev
          .map((fruit) => ({
            ...fruit,
            y: fruit.y + 1, // 落下速度を遅く
          }))
          .filter((fruit) => fruit.y <= 100) // 画面外のフルーツを削除
      );
    }, 50);

    return () => {
      clearInterval(fruitInterval);
      clearInterval(dropInterval);
    };
  }, []);

  useEffect(() => {
    // バスケットとフルーツの衝突判定
    setFruits((prev) =>
      prev.filter((fruit) => {
        const basketWidth = 10; // バスケットの幅（%）
        if (
          fruit.y >= 90 && // フルーツがバスケットの高さ付近
          fruit.x > basketPosition - basketWidth / 2 &&
          fruit.x < basketPosition + basketWidth / 2
        ) {
          setScore((s) => s + 1); // スコア加算
          return false; // キャッチしたフルーツを削除
        }
        return true;
      })
    );
  }, [fruits, basketPosition]);

  // クリック操作でバスケットを移動
  const handleWindowClick = useCallback(
    (event) => {
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
    [setBasketPosition]
  );

  useEffect(() => {
    window.addEventListener('click', handleWindowClick);
    return () => {
      window.removeEventListener('click', handleWindowClick);
    };
  }, [handleWindowClick]);

  return (
    <div className="game-container">
      <h1>🍎 フルーツキャッチゲーム 🍇</h1>
      <p>スコア: {score}</p>
      <div className="basket" style={{ left: `${basketPosition}%` }}></div>
      {fruits.map((fruit) => (
        <div
          key={fruit.id}
          className="fruit"
          style={{ left: `${fruit.x}%`, top: `${fruit.y}%` }}
        ></div>
      ))}
    </div>
  );
}

export default App;