import { env } from "./configs/config";
import app from "./app";
import http from "http";

const PORT = env.PORT || 8000;

const startServer = async () => {
  const server = http.createServer(app);
  server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`Server is listening on port ${PORT} and url: ${url}`);
  });
};

startServer().catch((err) => {
  console.error("Error while starting the server", err);
  process.exit(1);
});
