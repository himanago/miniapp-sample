import React, { useState, useEffect, useRef, useCallback } from "react";
import liff from "@line/liff";
import "./App.css";

function App() {
  const canvasRef = useRef(null);
  const [basketPosition, setBasketPosition] = useState(50);
  const [score, setScore] = useState(0);
  const [missedFruits, setMissedFruits] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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
      speed: 0.5 + Math.random() * 1,
      ...randomFruit,
    });
  };

  const updateGame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const basketWidth = 50;
    const basketHeight = 20;
    ctx.fillStyle = "blue";
    ctx.fillRect(
      (basketPosition / 100) * canvas.width - basketWidth / 2,
      canvas.height - basketHeight,
      basketWidth,
      basketHeight
    );

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
    }, 3000);

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

  const handleResize = useCallback(() => {
    setCanvasSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleWindowClick);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("click", handleWindowClick);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleWindowClick, handleResize]);

  const handleRestart = () => {
    setScore(0);
    setMissedFruits(0);
    setGameOver(false);
    fruits.current = [];
    fruitCounter.current = 0;
  };

  const handleShare = () => {
    if (liff.isApiAvailable("shareTargetPicker")) {
      liff.shareTargetPicker([
        {
          "type": "bubble",
          "hero": {
            "type": "image",
            "url": "https://raw.githubusercontent.com/himanago/miniapp-sample/refs/heads/main/icon.png",
            "size": "full",
            "aspectRatio": "20:13",
            "aspectMode": "cover"
          },
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": `フルーツキャッチゲームで\n${score}点をとったよ！`,
                    "size": "lg",
                    "color": "#000000",
                    "weight": "bold",
                    "wrap": true
                  }
                ],
                "spacing": "none"
              },
              {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "手軽に遊べるミニゲーム",
                    "size": "sm",
                    "color": "#999999",
                    "wrap": true
                  }
                ],
                "spacing": "none"
              },
              {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "button",
                    "action": {
                      "type": "uri",
                      "label": "遊んでみる！",
                      "uri": `https://miniapp.line.me/${liff.id}`
                    },
                    "style": "primary",
                    "height": "md",
                    "color": "#17c950"
                  },
                  {
                    "type": "button",
                    "action": {
                      "type": "uri",
                      "label": "シェアする",
                      "uri": `https://miniapp.line.me/${liff.id}/share`
                    },
                    "style": "link",
                    "height": "md",
                    "color": "#469fd6"
                  }
                ],
                "spacing": "xs",
                "margin": "lg"
              }
            ],
            "spacing": "md"
          },
          "footer": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "separator",
                "color": "#f0f0f0"
              },
              {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                  {
                    "type": "image",
                    "url": "https://raw.githubusercontent.com/himanago/miniapp-sample/refs/heads/main/icon.png",
                    "flex": 1,
                    "gravity": "center"
                  },
                  {
                    "type": "text",
                    "text": "フルーツキャッチゲーム",
                    "flex": 19,
                    "size": "xs",
                    "color": "#999999",
                    "weight": "bold",
                    "gravity": "center",
                    "wrap": false
                  },
                  {
                    "type": "image",
                    "url": "https://vos.line-scdn.net/service-notifier/footer_go_btn.png",
                    "flex": 1,
                    "gravity": "center",
                    "size": "xxs",
                    "action": {
                      "type": "uri",
                      "label": "action",
                      "uri": `https://miniapp.line.me/${liff.id}`
                    }
                  }
                ],
                "flex": 1,
                "spacing": "md",
                "margin": "md"
              }
            ]
          }
        }
      ]).then(function (res) {
        if (res) {
          console.log(`[${res.status}] Message sent!`);
        } else {
          console.log("TargetPicker was closed!");
        }
      })
      .catch(function (error) {
        alert(error);
        console.log("something wrong happen");
      });
    }
  };

  if (gameOver) {
    return (
      <div className="game-over">
        <h1>ゲームオーバー</h1>
        <p>スコア: {score}</p>
        <button onClick={handleRestart}>再開</button>
        <button onClick={handleShare}>結果をシェア</button>
      </div>
    );
  }

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height - 100}
      ></canvas>
      <p>スコア: {score}</p>
      <p>ミス: {missedFruits}/5</p>
    </div>
  );
}

export default App;
