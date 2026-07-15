import {useState} from "react";
import {useNavigate, Link} from "react-router-dom";


function Login(){

    const navigate = useNavigate();

    const [username,setUsername]=useState("");
    const [password,setPassword]=useState("");


    async function login(){

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/auth/login`,
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    username,
                    password
                })
            }
        );


        const json=await res.json();


        if(json.success){

            localStorage.setItem(
                "token",
                json.token
            );

            navigate("/");

        }else{

            alert(json.error);

        }

    }


    return (

        <div>

            <h1>Login</h1>


            <input
                placeholder="Username"
                value={username}
                onChange={e=>setUsername(e.target.value)}
            />


            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
            />


            <button onClick={login}>
                Login
            </button>

            <p>
                Don't have an account?{" "}
                <Link to="/register">
                    Register
                </Link>
            </p>


        </div>

    );

}


export default Login;