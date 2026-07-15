require("dotenv").config();

const express = require("express");
const cors = require("cors");

const repertoireRoutes = require("./routes/repertoires");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", repertoireRoutes);

const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});