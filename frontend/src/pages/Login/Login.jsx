import {useState} from "react";
import {useNavigate} from "react-router-dom";


function Login(){

    const navigate = useNavigate();

    const [email,setEmail]=useState("");
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
                    email,
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
                placeholder="Email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
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


        </div>

    );

}


export default Login;