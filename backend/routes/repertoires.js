const express = require("express");
const router = express.Router();

const db = require("../db");

// =======================
// GET
// =======================

router.get("/repertoires", async (req, res) => {

    try {

        const result = await db.query(
            `
            SELECT id, name, color, data
            FROM repertoires
            ORDER BY id
            `
        );

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// =======================
// CREATE / UPDATE
// =======================

router.post("/repertoires", async (req, res) => {

    try {

        const { id, name, color, data } = req.body;

        if (id) {

            await db.query(
                `
                UPDATE repertoires
                SET name=$1,
                    color=$2,
                    data=$3
                WHERE id=$4
                `,
                [name, color, data, id]
            );

            return res.json({
                success: true,
                id
            });

        }

        const result = await db.query(
            `
            INSERT INTO repertoires(name,color,data)
            VALUES($1,$2,$3)
            RETURNING id
            `,
            [name, color, data]
        );

        res.json({
            success: true,
            id: result.rows[0].id
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// =======================
// DELETE
// =======================

router.delete("/repertoires", async (req, res) => {

    try {

        await db.query(
            "DELETE FROM repertoires WHERE id=$1",
            [req.body.id]
        );

        res.json({
            success: true
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

module.exports = router;