import { users, type User, type InsertUser, todos, type Todo, type InsertTodo, type UpdateTodo } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, isNull, isNotNull } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Todo methods
  getTodos(category?: string): Promise<Todo[]>;
  getTodoById(id: number): Promise<Todo | undefined>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: number, todo: Partial<UpdateTodo>): Promise<Todo | undefined>;
  deleteTodo(id: number): Promise<boolean>;
  toggleTodoCompletion(id: number): Promise<Todo | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async getTodos(category?: string): Promise<Todo[]> {
    if (category) {
      return await db
        .select()
        .from(todos)
        .where(eq(todos.category, category))
        .orderBy(desc(todos.createdAt));
    }
    
    return await db
      .select()
      .from(todos)
      .orderBy(desc(todos.createdAt));
  }
  
  async getTodoById(id: number): Promise<Todo | undefined> {
    const [todo] = await db.select().from(todos).where(eq(todos.id, id));
    return todo;
  }
  
  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const now = new Date();
    const [todo] = await db
      .insert(todos)
      .values({
        ...insertTodo,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return todo;
  }
  
  async updateTodo(id: number, updateData: Partial<UpdateTodo>): Promise<Todo | undefined> {
    const [todo] = await db
      .update(todos)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(todos.id, id))
      .returning();
    return todo;
  }
  
  async deleteTodo(id: number): Promise<boolean> {
    const result = await db
      .delete(todos)
      .where(eq(todos.id, id))
      .returning({ id: todos.id });
    
    return result.length > 0;
  }
  
  async toggleTodoCompletion(id: number): Promise<Todo | undefined> {
    // Get the todo first to check its current completion status
    const [existingTodo] = await db
      .select()
      .from(todos)
      .where(eq(todos.id, id));
    
    if (!existingTodo) {
      return undefined;
    }
    
    const [updatedTodo] = await db
      .update(todos)
      .set({
        completedAt: existingTodo.completedAt ? null : new Date(),
        updatedAt: new Date(),
      })
      .where(eq(todos.id, id))
      .returning();
    
    return updatedTodo;
  }
}

export const storage = new DatabaseStorage();
