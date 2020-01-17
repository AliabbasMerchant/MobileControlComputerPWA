const express = require("express");

const app = express();
app.use(express.static(__dirname + "/public"));
// app.use(express.urlencoded({ extended: true }));

// routes
app.get("*", (_req, res) => {
    res.sendFile(__dirname + "/index.html")
});

app.listen(process.env.PORT || 3000, process.env.IP);
