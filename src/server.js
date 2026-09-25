// import dotenv from "dotenv";
// import http from "http";

// import app from "./app.js";
// import connectDB from "./config/db.js";
// import { initSocket } from "./socket/index.js";

// dotenv.config();

// connectDB();

// const PORT = process.env.PORT || 5000;

// const server = http.createServer(app);
// const io = initSocket(server);

// app.set("io", io);

// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
import dotenv from "dotenv";
import http from "http";

import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./socket/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = initSocket(server);

app.set("io", io);

server.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
});