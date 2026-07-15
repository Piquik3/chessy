const express = require("express");
const router = express.Router();
const db = require("../db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// REGISTER
router.post("/register", async (req,res)=>{

    try{

        const {username,email,password} = req.body;

        const hashed = await bcrypt.hash(password,10);

        const [result] = await db.query(
            `
            INSERT INTO users(username,email,password)
            VALUES($1,$2,$3)
            RETURNING id
            `,
            [username,email,hashed]
        );


        res.json({
            success:true,
            id:result[0].id
        });


    }catch(err){

        res.status(500).json({
            success:false,
            error:err.message
        });

    }

});


// LOGIN
router.post("/login", async(req,res)=>{

    const {username,password}=req.body;

    const result = await db.query(
        "SELECT * FROM users WHERE username=$1",
        [username]
    );

    if(result.rows.length===0){
        return res.status(401).json({
            success:false,
            error:"Invalid credentials"
        });
    }

    const user=result.rows[0];

    const valid = await bcrypt.compare(
        password,
        user.password
    );

    if(!valid){
        return res.status(401).json({
            success:false,
            error:"Invalid credentials"
        });
    }

    const token = jwt.sign(
        {
            id:user.id,
            username:user.username
        },
        process.env.JWT_SECRET
    );

    res.json({
        success:true,
        token
    });

});


module.exports = router;