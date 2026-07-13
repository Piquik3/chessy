const express = require("express");
const router = express.Router();

const db = require("../db");

// GET
router.get("/repertoires", (req, res) => {

    db.all(
        "SELECT * FROM repertoires",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            const repertoires = rows.map(rep => ({
                id: rep.id,
                name: rep.name,
                color: rep.color,
                data: JSON.parse(rep.data)
            }));

            res.json(repertoires);

        }
    );

});

// POST (create/update)
router.post("/repertoires", (req, res) => {

    const { id, name, color, data } = req.body;

    const json = JSON.stringify(data);

    if (id) {

        db.run(
            `
            UPDATE repertoires
            SET name=?, color=?, data=?
            WHERE id=?
            `,
            [name, color, json, id],
            function(err) {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        error: err.message
                    });
                }

                res.json({
                    success: true,
                    id
                });

            }
        );

    } else {

        db.run(
            `
            INSERT INTO repertoires(name,color,data)
            VALUES(?,?,?)
            `,
            [name, color, json],
            function(err) {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        error: err.message
                    });
                }

                res.json({
                    success: true,
                    id: this.lastID
                });

            }
        );

    }

});

// DELETE
router.delete("/repertoires", (req, res) => {

    db.run(
        "DELETE FROM repertoires WHERE id=?",
        [req.body.id],
        function(err) {

            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            res.json({
                success: true
            });

        }
    );

});

module.exports = router;