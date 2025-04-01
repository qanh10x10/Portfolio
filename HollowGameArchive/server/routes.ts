import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // This is a static website, so we don't need any API routes
  // We only need to serve the static files, which is handled in server/vite.ts

  const httpServer = createServer(app);
  return httpServer;
}
