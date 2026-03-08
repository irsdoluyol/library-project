import path from "path";
import { fileURLToPath } from "url";
import { MongoMemoryServer } from "mongodb-memory-server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.MONGOMS_DOWNLOAD_DIR = path.join(__dirname, "..", "node_modules", ".cache", "mongodb-binaries");

let mongoServer;
let app;

export const appPromise = (async () => {
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";
    process.env.NODE_ENV = "test";
    const mod = await import("../app.js");
    app = mod.default;
  }
  return app;
})();

export default async function setup() {
  await appPromise;
}

export function getApp() {
  return app;
}
