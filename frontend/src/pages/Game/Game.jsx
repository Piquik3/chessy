import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useNavigate, useParams } from "react-router-dom";
import { getRepertoires } from "../../api";

function Game() {
  const [repertoires, setRepertoires] = useState([]);
  const [loading, setLoading] = useState(true);
  const { opening } = useParams();
  const repertoire = repertoires.find(
      r => r.id === Number(opening)
  );
  const playerColor = repertoire?.color;

  const [game, setGame] = useState(new Chess());
  const [node, setNode] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("Play the move of the repertoire.");

  const navigate = useNavigate();

  const isPlayerTurn =
    (playerColor === "white" && game.turn() === "w") ||
    (playerColor === "black" && game.turn() === "b");

  function playBot(nodeRef, gameRef) {
    const moves = Object.entries(
      nodeRef.data
        ? nodeRef.data.children || {}
        : nodeRef.children || {}
    );

    if (moves.length === 0) {
      setMessage("🏁 End of variation !");
     return;
    }

    const [san, nextNode] =
      moves[Math.floor(Math.random() * moves.length)];

    const g = new Chess(gameRef.fen());

    const move = g.move(san);

    if (!move) return;

    setGame(g);
    setNode(nextNode);
    setHistory((h) => [...h, move]);
  }

  function onDrop(sourceSquare, targetSquare) {
    if (!isPlayerTurn) return false;

    const g = new Chess(game.fen());
    const move = g.move({ from: sourceSquare, to: targetSquare, promotion: "q" });

    if (!move) return false;

    const nextNode = node?.children?.[move.san];

    if (!nextNode) {
      setMessage("❌ Bad move !");
      return false;
    }

    setMessage("✅ Good move !");

    setGame(g);
    setHistory((h) => [...h, move]);
    setNode(nextNode);

    if (
        !nextNode.children ||
        Object.keys(nextNode.children).length === 0
    ) {

        setMessage("🏁 End of variation !");

        return true;

    }

    // 🤖 bot joue juste après
    setTimeout(() => {
      playBot(nextNode, g);
    }, 300);

    return true;
  }

  function resetGame() {
    setGame(new Chess());
    setHistory([]);
    setNode({children: repertoire.data.children});
    setMessage("Play the move of the repertoire.");

    if (playerColor === "black") {
      setTimeout(() => playBot(repertoire, new Chess()), 300);
    }
  }

  useEffect(() => {
    if (repertoire) {
      setNode({children: repertoire.data.children});
    }
  }, [repertoire]);

  useEffect(() => {
    if (repertoire && repertoire.color === "black") {
      playBot(
        {
          children: repertoire.data.children
        },
        new Chess()
      );}
  }, [repertoire]);

  useEffect(() => {
    async function loadRepertoires() {
      try {
        const json = await getRepertoires();

        json.forEach(rep => {

            if (Array.isArray(rep.data.children)) {
                rep.data.children = Object.fromEntries(
                    Object.entries(rep.data.children)
                );
            }

        });

        setRepertoires(json);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadRepertoires();
  }, []);


  return (
    <div className="game">
      <aside className="sidebar">
        <h2>Repertoire Training</h2>

        <p>{message}</p>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
    
            <button onClick={resetGame}>
            🔄 Restart
            </button>

            <button onClick={() => navigate("/")}>
            🏠 Back Home
            </button>

        </div>
      </aside>

      <main className="board-container">
        <div className="board-wrapper">
          <Chessboard
            position={game.fen()}
            boardOrientation={playerColor}
            onPieceDrop={onDrop}
          />
        </div>
      </main>

      <aside className="sidebar">
        <h2>Historique</h2>

        {history.length === 0 && <p>Aucun coup joué</p>}

        <div className="history-list">
          {history
            .reduce((rows, move, index) => {
              if (index % 2 === 0) rows.push([move]);
              else rows[rows.length - 1].push(move);
              return rows;
            }, [])
            .map((pair, i) => (
              <div key={i} className="history-row">
                <span className="move-index">{i + 1}.</span>

                <span className="move-white">♙ {pair[0]?.san || pair[0]}</span>

                <span className="move-black">
                  {pair[1] ? `♟ ${pair[1]?.san || pair[1]}` : ""}
                </span>
              </div>
            ))}
        </div>
      </aside>
    </div>
  );
}

export default Game;