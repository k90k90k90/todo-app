import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTodoSchema, updateTodoSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  const apiRouter = express.Router();
  
  // Get all todos with optional category filter
  apiRouter.get("/todos", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const todos = await storage.getTodos(category);
      res.json(todos);
    } catch (error) {
      console.error("Error fetching todos:", error);
      res.status(500).json({ message: "Failed to fetch todos" });
    }
  });
  
  // Get a specific todo by ID
  apiRouter.get("/todos/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid todo ID" });
      }
      
      const todo = await storage.getTodoById(id);
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      res.json(todo);
    } catch (error) {
      console.error("Error fetching todo:", error);
      res.status(500).json({ message: "Failed to fetch todo" });
    }
  });
  
  // Create a new todo
  apiRouter.post("/todos", async (req: Request, res: Response) => {
    try {
      const todoData = insertTodoSchema.parse(req.body);
      const newTodo = await storage.createTodo(todoData);
      res.status(201).json(newTodo);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating todo:", error);
      res.status(500).json({ message: "Failed to create todo" });
    }
  });
  
  // Update a todo
  apiRouter.patch("/todos/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid todo ID" });
      }
      
      const todoData = updateTodoSchema.partial().parse(req.body);
      const updatedTodo = await storage.updateTodo(id, todoData);
      
      if (!updatedTodo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      res.json(updatedTodo);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating todo:", error);
      res.status(500).json({ message: "Failed to update todo" });
    }
  });
  
  // Delete a todo
  apiRouter.delete("/todos/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid todo ID" });
      }
      
      const deleted = await storage.deleteTodo(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting todo:", error);
      res.status(500).json({ message: "Failed to delete todo" });
    }
  });
  
  // Toggle todo completion status
  apiRouter.post("/todos/:id/toggle", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid todo ID" });
      }
      
      const updatedTodo = await storage.toggleTodoCompletion(id);
      
      if (!updatedTodo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      res.json(updatedTodo);
    } catch (error) {
      console.error("Error toggling todo completion:", error);
      res.status(500).json({ message: "Failed to toggle todo completion" });
    }
  });
  
  // Mount the API router under /api prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}

// Import express here to avoid a circular dependency issue
import express from "express";
