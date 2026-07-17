import "./Home.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {getRepertoires,saveRepertoire,deleteRepertoire,} from "../../api";

function Home() {
  const navigate = useNavigate();

  const [repertoires, setRepertoires] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("white");

  const username = localStorage.getItem("username");


  async function createOpening() {

  if (!newName.trim()) {
    alert("Entre un nom d'ouverture.");
    return;
  }

  const json = await saveRepertoire({
    name: newName,
    color: newColor,
    data: {
        children: {}
    }
});

  if (json.success) {

    setRepertoires(prev => [
      ...prev,
      {
          id: json.id,
          name: newName,
          color: newColor,
          data: {
              children: {}
          }
      }
  ]);

    setNewName("");
    setNewColor("white");

  } else {

    alert(json.error);

  }

}

    function logout() {
        localStorage.removeItem("token");
        navigate("/login");
    }


  async function deleteOpening(id, name){

    if(!window.confirm("Supprimer cette ouverture ?"))
        return;

    const json = await deleteRepertoire(id);

    if(json.success){

        setRepertoires(prev =>
          prev.filter(rep => rep.id !== id)
      );

    }else{

        alert(json.error);

    }

}

  useEffect(() => {
    async function loadRepertoires() {
      try {
        const json = await getRepertoires();
        console.log(json);
console.log(Array.isArray(json));

        setRepertoires(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadRepertoires();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="home">
      <div className="overlay">
        <div className="hero">

        <h1>♟ Chessy</h1>

        <div className="top-bar">
            <span>👤 {username}</span>
            <button className="logout-button" onClick={logout}>
                Logout
            </button>
        </div>

        <div className="home-content">

            <div className="panel">

                <h2>New Opening</h2>

                <div className="new-opening">

                    <input
                        placeholder="Name"
                        value={newName}
                        onChange={(e)=>setNewName(e.target.value)}
                    />

                    <select
                        value={newColor}
                        onChange={(e)=>setNewColor(e.target.value)}
                    >
                        <option value="white">White</option>
                        <option value="black">Black</option>
                    </select>

                    <button
                        className="play-btn"
                        onClick={createOpening}
                    >
                        ➕ Create
                    </button>

                </div>

            </div>


            <div className="panel">

                <h2>My Openings</h2>

                <div className="opening-grid">

                    {repertoires.map((repertoire) => (

                        <div
                            key={repertoire.id}
                            className="opening-card"
                        >

                            <h3>{repertoire.name}</h3>

                            <div className="opening-color">
                                {repertoire.color==="white"
                                    ? "⚪ White"
                                    : "⚫ Black"}
                            </div>

                            <div className="opening-buttons">

                                <button
                                    className="play-btn"
                                    onClick={()=>navigate(`/game/${repertoire.id}`)}
                                >
                                    ▶ Practice
                                </button>

                                <button
                                    className="play-btn"
                                    onClick={()=>navigate(`/theory/${repertoire.id}`)}
                                >
                                    📖 Edit
                                </button>

                                <button
                                    className="delete-btn"
                                    onClick={()=>deleteOpening(repertoire.id)}
                                >
                                    🗑 Delete
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    </div>
      </div>
    </div>
  );
}

export default Home;