import express from "express";
import path from "path";

const app = express();
const __dirname = new URL('.', import.meta.url).pathname;

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
