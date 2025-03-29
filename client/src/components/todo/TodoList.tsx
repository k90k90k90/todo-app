import { useState } from 'react';
import { Todo, sortTodos } from '@/types/todo';
import TodoItem from './TodoItem';
import { Card } from '@/components/ui/card';
import { IconFileList } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

interface TodoListProps {
  todos: Todo[];
  activeTab: string;
  sortOption: string;
  onTodoClick: (todo: Todo) => void;
  onEditTodo: (todo: Todo) => void;
  onDeleteTodo: (id: number) => void;
  onToggleComplete: (id: number) => void;
  onNewTodo: () => void;
}

export default function TodoList({
  todos,
  activeTab,
  sortOption,
  onTodoClick,
  onEditTodo,
  onDeleteTodo,
  onToggleComplete,
  onNewTodo
}: TodoListProps) {
  // Sort todos based on the current sort option
  const sortedTodos = sortTodos(todos, sortOption);

  return (
    <div className="space-y-4 mb-8">
      {sortedTodos.length > 0 ? (
        sortedTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            category={activeTab as 'work' | 'personal'}
            onTodoClick={() => onTodoClick(todo)}
            onEditTodo={() => onEditTodo(todo)}
            onDeleteTodo={() => onDeleteTodo(todo.id)}
            onToggleComplete={() => onToggleComplete(todo.id)}
          />
        ))
      ) : (
        <Card className="py-12 flex flex-col items-center justify-center bg-white rounded-lg border-2 border-dashed border-slate-300">
          <div className="text-center">
            <IconFileList className="mx-auto text-slate-400 text-5xl mb-3" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">No tasks yet</h3>
            <p className="text-slate-500 mb-4">Get started by creating your first task</p>
            <Button 
              onClick={onNewTodo}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <IconFileList className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
