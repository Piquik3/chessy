import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import "./Theory.css";
import { useParams, useNavigate } from "react-router-dom";
import { initStockfish, analyzeStockfish } from "../../utils/stockfish";
import { getRepertoires, saveRepertoire } from "../../api";

function Theory() {
  const { opening } = useParams();

  const navigate = useNavigate();

  const [repertoires, setRepertoires] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tree, setTree] = useState(null);
  const [game, setGame] = useState(new Chess());
  const [path, setPath] = useState([]);

  const playerColor = tree?.color;

  const [evaluation, setEvaluation] = useState("--");
  const [depth, setDepth] = useState("--");
  const [stockfishFen, setStockfishFen] = useState("");
  const [scoreText, setScoreText] = useState("--");
  const [bestMoves,setBestMoves] = useState([]);
  const [bestEvaluation, setBestEvaluation] = useState(null);
  

  useEffect(() => {
    async function loadRepertoire() {
      try {
        const json = await getRepertoires();

        setRepertoires(json);

        const repertoire = json.find(
            r => r.id === Number(opening)
        );

        if (repertoire) {

            const copy = structuredClone(repertoire);

            if (Array.isArray(copy.data.children)) {
                copy.data.children = Object.fromEntries(
                    Object.entries(copy.data.children)
                );
            }

            setTree(copy);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadRepertoire();
  }, [opening]);

  useEffect(() => {
}, [tree]);

  useEffect(()=>{
    initStockfish();
},[]);

  useEffect(()=>{
    if(!game)
        return;
    setBestMoves([]);
    setDepth("--");
    setBestEvaluation(null);
    analyzeStockfish(
        game.fen(),
        (result)=>{
            if(result.fen){
                setStockfishFen(result.fen);
            }
            // profondeur
            if(result.depth){
                setDepth(result.depth);
            }
            // evaluation
            if(result.evaluation !== undefined){
              // uniquement le premier coup Stockfish
              if(result.rank === 1 || !bestEvaluation){
                  setBestEvaluation(result);
                  if(typeof result.evaluation === "string"){
                      // MAT
                      setScoreText(
                          result.evaluation
                      );
                  }else{
                      const score =
                          result.evaluation;
                      setEvaluation(
                          (score / 100).toFixed(2)
                      );
                      if(score > 0){
                          setScoreText(
                              `Blanc +${(score/100).toFixed(2)}`
                          );
                      }else if(score < 0){
                          setScoreText(
                              `Noir ${(score/100).toFixed(2)}`
                          );
                      }else{
                          setScoreText(
                              "Égalité 0.00"
                          );
                      }
                  }
              }
          }
            // meilleurs coups MultiPV
            if(result.move){
                setBestMoves(prev=>{
                    const filtered =
                        prev.filter(
                            m=>m.rank !== result.rank
                        );
                    return [
                        ...filtered,
                        {
                            rank: result.rank,
                            move: result.move,
                            score: result.score
                        }
                    ]
                    .sort(
                        (a,b)=>a.rank-b.rank
                    )
                    .slice(0,3);
                });
            }
        }
    );
},[game]);


  function convertUCI(move){
    if(!move || move.length < 4)
        return "--";
    const from =
        move.substring(0,2);
    const to =
        move.substring(2,4);
    const test =
        new Chess(stockfishFen || game.fen());
    const piece =
        test.get(from);
    if(!piece)
        return `${from}-${to}`;
    const pieces = {
        n:"N",
        b:"B",
        r:"R",
        q:"Q",
        k:"K"
    };
    const letter =
        pieces[piece.type] || "";
    const target =
        test.get(to);
    const separator =
        target ? "x" : "-";
    if(piece.type === "p"){
        return `${from}${separator}${to}`;
    }
    return `${letter}${from}${separator}${to}`;
}

  // 🔍 node courant dans l'arbre
  function getNode() {
    if (!tree) return null;

    let node = tree.data;

    for (const move of path) {
      node = node?.children?.[move];
      if (!node) break;
    }

    return node;
  }

  const node = getNode();

  // ♟️ jouer un coup et l'ajouter au répertoire
  function onDrop(sourceSquare, targetSquare) {
    const gameCopy = new Chess(game.fen());

    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (!move) return false;

    const newTree = structuredClone(tree);

    let n = newTree.data;

    for (const m of path) {
      if (!n.children || Array.isArray(n.children)) {
        n.children = {};
      }
      if (!n.children[m]) {
        n.children[m] = { move: m, children: {} };
      }
      n = n.children[m];
    }

    if (!n.children || Array.isArray(n.children)) {
      n.children = {};
    }

    if (!n.children[move.san]) {
      n.children[move.san] = {
        move: move.san,
        prob: 1,
        type: "",
        comment: "",
        children: {}
      };
    }
    
    setTree(newTree);
    setPath(prev => [...prev, move.san]);
    setGame(gameCopy);

    return true;
  }

  // ▶️ avancer automatiquement dans le répertoire
  function nextMove() {
    const node = getNode();

    if (
      !node ||
      !node.children ||
      Object.keys(node.children).length === 0
    ) {
      return; // Fin de variante : on ne fait rien
    }

    const [move] = Object.entries(node.children).sort(
      (a, b) => (b[1].prob ?? 0) - (a[1].prob ?? 0)
    )[0];

    const g = new Chess(game.fen());

    if (!g.move(move)) {
      return;
    }

    setGame(g);
    setPath(prev => [...prev, move]);
  }

  // 🔄 reset
  function resetPosition() {
    setGame(new Chess());
    setPath([]);
  }


  return (
    <div className="game">

      {/* ======== ÉDITEUR ======== */}
      <aside className="sidebar">

        <h2>Edit</h2>

        <div style={{ marginBottom: 20 }}>

          <h3>Opening</h3>

          <input
            type="text"
            value={tree?.name || ""}
            placeholder="Opening name"
            onChange={(e) =>
              setTree({
                ...tree,
                name: e.target.value,
              })
            }
            style={{
              width: "100%",
              background: "#222",
              color: "white",
              padding: "8px",
              marginBottom: "10px",
              boxSizing: "border-box",
            }}
          />

          <select
            value={tree?.color || "white"}
            onChange={(e) =>
              setTree({
                ...tree,
                color: e.target.value,
              })
            }
            style={{
              width: "100%",
              background: "#222",
              color: "white",
              padding: "8px",
              boxSizing: "border-box",
            }}
          >
            <option value="white">⚪ White</option>
            <option value="black">⚫ Black</option>
          </select>

        </div>

        <div style={{ marginBottom: 20 }}></div>

        <p style={{ opacity: 0.6 }}>
          {path.length === 0
            ? "Position initiale"
            : path.reduce((text, move, index) => {
                const moveNumber = Math.floor(index / 2) + 1;

                if (index % 2 === 0) {
                  return text + `${moveNumber}. ${move} `;
                }

                return text + `${move} `;
              }, "").trim()}
        </p>

        <hr />

        <div style={{ marginBottom: 20 }}></div>

        <h3>Available moves</h3>

        <div className="history-list">

          {node?.children
            ? Object.entries(node.children).map(([move, child]) => {

                const moveNumber = Math.floor(path.length / 2) + 1;
                const isWhiteMove = path.length % 2 === 0;

                return (

                  <div
                    key={move}
                    className="history-row"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10
                    }}
                  >

                    <span
                      style={{ cursor: "pointer", flex: 1 }}
                      onClick={() => {

                        const g = new Chess(game.fen());
                        g.move(move);

                        setGame(g);
                        setPath([...path, move]);

                      }}
                    >
                      {isWhiteMove
                        ? `${moveNumber}. ${move}`
                        : `${moveNumber}... ${move}`}
                    </span>

                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={child.prob ?? 1}
                      style={{ width: 60 }}
                      onChange={(e) => {

                        const newTree = structuredClone(tree);

                        let n = newTree.data;

                        for (const m of path) {
                          n = n.children[m];
                        }

                        n.children[move].prob = parseFloat(e.target.value);

                        setTree(newTree);

                      }}
                    />

                    <button
                      onClick={async () => {

                        if (!window.confirm("Supprimer ce coup ?")) return;

                        const newTree = structuredClone(tree);

                        let n = newTree.data;

                        for (const m of path) {
                          n = n.children[m];
                        }

                        delete n.children[move];

                        setTree(newTree);

                        // Sauvegarde en BDD
                        const json = await saveRepertoire({
                            id: newTree.id,
                            name: newTree.name,
                            color: newTree.color,
                            data: newTree.data,
                        });

                        if (!json.success) {
                          alert(json.error);
                        }

                      }}
                    >
                      🗑
                    </button>

                  </div>

                );

              })
            : <p>End of line.</p>}

        </div>

        <div style={{ marginBottom: 25 }}></div>

        <button
          onClick={() => {

            if (path.length === 0) return;

            const newPath = path.slice(0, -1);

            const g = new Chess();

            newPath.forEach(m => g.move(m));

            setGame(g);
            setPath(newPath);

          }}
        >
          ⬅ Back
        </button>

        <button onClick={nextMove}>
          ➡ Next
        </button>

        <button onClick={resetPosition}>
          🔄 Start
        </button>

        <button
          onClick={async () => {
            const saveData = {
              id: tree.id,
              name: tree.name,
              color: tree.color,
              data: tree.data
            };
    
            const json = await saveRepertoire(saveData);

              if (!json.success) {
                  alert(json.error);
              }}
            }
        >
          💾 Save
        </button>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          <button onClick={() => navigate("/")}>
            🏠 Back Home
          </button>
        </div>

      </aside>

      {/* ======== ÉCHIQUIER ======== */}

      <main className="board-container">
        <div
          className="board-wrapper"
          onWheel={(e) => {
            e.preventDefault();

            if (e.deltaY > 0) {
              nextMove();
            } else {
              if (path.length === 0) return;

              const newPath = path.slice(0, -1);

              const g = new Chess();
              newPath.forEach(move => g.move(move));

              setGame(g);
              setPath(newPath);
            }
          }}
        >
          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            boardOrientation={playerColor}
          />
        </div>
      </main>

      {/* ======== STOCKFISH ======== */}

          <aside className="sidebar">

            <h2>Move annotation</h2>

            <h3>Classification</h3>

            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "10px"
                }}
            >
                <tbody>

                    {[
                        { value: "brillant", label: "!! Brillant move" },
                        { value: "good", label: "! Good move" },
                        { value: "interesting", label: "!? Interesting move" },
                        { value: "inaccuracy", label: "?! Inaccuracy" },
                        { value: "mistake", label: "? Mistake" },
                        { value: "blunder", label: "?? Blunder" }
                    ].map(type => (

                        <tr
                            key={type.value}
                            onClick={() => {

                                const newTree = structuredClone(tree);

                                let node = newTree.data;

                                for (const move of path) {
                                    node = node.children[move];
                                }

                                node.type =
                                node.type === type.value
                                    ? ""
                                    : type.value;

                                setTree(newTree);

                            }}
                            style={{
                                cursor: "pointer",
                                background:
                                    node?.type === type.value
                                        ? "#3b82f6"
                                        : "transparent",
                                color:
                                    node?.type === type.value
                                        ? "white"
                                        : "inherit"
                            }}
                        >
                            <td
                                style={{
                                    padding: "10px",
                                    border: "1px solid #555"
                                }}
                            >
                                {type.label}
                            </td>

                            <td
                                style={{
                                    width: "40px",
                                    textAlign: "center",
                                    border: "1px solid #555"
                                }}
                            >
                                {node?.type === type.value ? "✓" : ""}
                            </td>

                        </tr>

                    ))}

                </tbody>
            </table>

            <h3 style={{ marginTop: "25px" }}>
                Comment
            </h3>

            <textarea
                rows={8}
                style={{
                    width: "100%",
                    background: "#222",
                    color: "white",
                    padding: "10px",
                    boxSizing: "border-box",
                    resize: "vertical"
                }}
                value={node?.comment || ""}
                onChange={(e) => {

                    const newTree = structuredClone(tree);

                    let node = newTree.data;

                    for (const move of path) {
                        node = node.children[move];
                    }

                    node.comment = e.target.value;

                    setTree(newTree);

                }}
            />

        </aside>
      

    </div>
  );
}

export default Theory;