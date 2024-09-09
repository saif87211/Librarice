import { app } from "./app.js";

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(port, () => console.log(`⚙ Server is running hot on port ${port}`));
