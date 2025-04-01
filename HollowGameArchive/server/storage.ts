// This file is kept as a placeholder for potential future backend integration
// For now, our game portfolio is just a static landing page without database functionality

export interface IStorage {
  // Placeholder for future storage methods
}

export class MemStorage implements IStorage {
  constructor() {
    // Initialize storage if needed in the future
  }
}

export const storage = new MemStorage();
