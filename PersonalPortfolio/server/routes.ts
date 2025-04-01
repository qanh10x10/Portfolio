import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for handling contact form submissions
  app.post("/api/contact", (req, res) => {
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    // In a real application, you would send an email or store this in a database
    // For now, we'll just return a success response
    return res.status(200).json({ 
      message: "Message received successfully",
      data: { name, email, subject, message }
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
