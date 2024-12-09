import { useEffect, useState } from "react";
import liff from "@line/liff";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [basketPosition, setBasketPosition] = useState(50); // バスケットのX位置
  const [fruits, setFruits] = useState([]); // 落ちてくるフルーツ
  const [score, setScore] = useState(0); // スコア
  const [gameOver, setGameOver] = useState(false);

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
    // フルーツを定期的に生成
    const fruitInterval = setInterval(() => {
      setFruits((prev) => [
        ...prev,
        { id: Date.now(), x: Math.random() * 90, y: 0 },
      ]);
    }, 1000);

    // フルーツの落下処理
    const dropInterval = setInterval(() => {
      setFruits((prev) =>
        prev
          .map((fruit) => ({
            ...fruit,
            y: fruit.y + 5,
          }))
          .filter((fruit) => fruit.y < 100) // 落ちすぎたフルーツを削除
      );
    }, 200);

    return () => {
      clearInterval(fruitInterval);
      clearInterval(dropInterval);
    };
  }, []);

  useEffect(() => {
    // フルーツとバスケットの衝突検出
    setFruits((prev) =>
      prev.filter((fruit) => {
        if (
          fruit.y > 85 &&
          fruit.x > basketPosition - 10 &&
          fruit.x < basketPosition + 10
        ) {
          setScore((s) => s + 1);
          return false;
        }
        return true;
      })
    );
  }, [fruits, basketPosition]);

  const moveBasket = (direction) => {
    setBasketPosition((pos) => Math.max(0, Math.min(90, pos + direction)));
  };

  return (
<div className="game-container">
      <h1>🍎 フルーツキャッチゲーム 🍇</h1>
      <p>スコア: {score}</p>
      {gameOver ? (
        <h2>ゲームオーバー！</h2>
      ) : (
        <>
          <div
            className="basket"
            style={{ left: `${basketPosition}%` }}
          ></div>
          {fruits.map((fruit) => (
            <div
              key={fruit.id}
              className="fruit"
              style={{ left: `${fruit.x}%`, top: `${fruit.y}%` }}
            ></div>
          ))}
          <div className="controls">
            <button onClick={() => moveBasket(-5)}>左</button>
            <button onClick={() => moveBasket(5)}>右</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;