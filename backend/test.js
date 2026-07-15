const bcrypt = require("bcrypt");
const db = require("./db");

async function createUser(){

    const password = await bcrypt.hash(
        "test123",
        10
    );

    await db.query(
        `
        INSERT INTO users(username,password)
        VALUES($1,$2)
        `,
        [
            "test",
            password
        ]
    );

    console.log("Test user created");

    process.exit();
}

createUser();