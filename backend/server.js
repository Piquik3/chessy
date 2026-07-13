require("dotenv").config();

const express = require("express");
const cors = require("cors");

require("./db");

const repertoireRoutes = require("./routes/repertoires");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", repertoireRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running");
});