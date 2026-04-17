require("dotenv").config();
const express = require("express");

const uploadRoute = require("./routes/upload");
const queryRoute = require("./routes/query");

const app = express();
app.use(express.json());

app.use("/upload", uploadRoute);
app.use("/query", queryRoute);

app.listen(3000, () => console.log("Server running on port 3000"));