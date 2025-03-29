import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTodoSchema, updateTodoSchema, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import "./types"; // Import custom types
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // API Routes
  const apiRouter = express.Router();
  
  // Get all todos with optional category filter
  apiRouter.get("/todos", async (req: Request, res: Response) => {
    if (!req.requireAuth()) return;
    
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
    if (!req.requireAuth()) return;
    
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
    if (!req.requireAuth()) return;
    
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
    if (!req.requireAuth()) return;
    
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
    if (!req.requireAuth()) return;
    
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
    if (!req.requireAuth()) return;
    
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
  
  // Register a new user
  apiRouter.post("/register", async (req: Request, res: Response) => {
    try {
      // Validate user data with zod schema
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create the user with hashed password
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Log in the user
      req.login(newUser, (err) => {
        if (err) {
          console.error("Error logging in after registration:", err);
          return res.status(500).json({ message: "Registration successful but failed to log in" });
        }
        
        // Return the user data
        return res.status(201).json(newUser);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  // Mount the API router under /api prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}

// Import express here to avoid a circular dependency issue
import express from "express";
