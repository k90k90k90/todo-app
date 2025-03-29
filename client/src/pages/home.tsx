import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Todo, NewTodo, todoSortOptions } from '@/types/todo';
import { useToast } from '@/hooks/use-toast';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TodoHeader from '@/components/todo/TodoHeader';
import TodoList from '@/components/todo/TodoList';
import TodoModal from '@/components/todo/TodoModal';
import DeleteConfirmationModal from '@/components/todo/DeleteConfirmationModal';
import ViewTodoModal from '@/components/todo/ViewTodoModal';
import { IconBriefcase, IconUser, IconCheckboxCircle } from '@/components/ui/icons';

export default function Home() {
  const { toast } = useToast();
  
  // State for active tab, modals, and sorting
  const [activeTab, setActiveTab] = useState<string>('work');
  const [sortOption, setSortOption] = useState<string>('dateCreated-desc');
  const [todoModalOpen, setTodoModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<number | null>(null);

  // Fetch todos query
  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['/api/todos'],
    refetchOnWindowFocus: true,
  });

  // Filter todos based on active tab
  const filteredTodos = todos.filter((todo: Todo) => todo.category === activeTab);
  
  // Count completed todos
  const completedTodos = filteredTodos.filter((todo: Todo) => todo.completedAt).length;

  // Create todo mutation
  const createTodoMutation = useMutation({
    mutationFn: async (newTodo: NewTodo) => {
      const res = await apiRequest('POST', '/api/todos', newTodo);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
      toast({
        title: 'Success!',
        description: 'Todo created successfully',
      });
      setTodoModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create todo: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Update todo mutation
  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<NewTodo> }) => {
      const res = await apiRequest('PATCH', `/api/todos/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
      toast({
        title: 'Success!',
        description: 'Todo updated successfully',
      });
      setTodoModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update todo: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Delete todo mutation
  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/todos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
      toast({
        title: 'Success!',
        description: 'Todo deleted successfully',
      });
      setDeleteModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete todo: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Toggle completion mutation
  const toggleCompletionMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/todos/${id}/toggle`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
      toast({
        title: 'Success!',
        description: 'Todo status updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update todo status: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Event handlers
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleNewTodo = () => {
    setSelectedTodo(null);
    setTodoModalOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    setTodoModalOpen(true);
    setViewModalOpen(false);
  };

  const handleSaveTodo = (data: NewTodo) => {
    if (selectedTodo) {
      updateTodoMutation.mutate({ id: selectedTodo.id, data });
    } else {
      createTodoMutation.mutate(data);
    }
  };

  const handleDeleteTodo = (id: number) => {
    setTodoToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (todoToDelete !== null) {
      deleteTodoMutation.mutate(todoToDelete);
      setTodoToDelete(null);
    }
  };

  const handleViewTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    setViewModalOpen(true);
  };

  const handleToggleComplete = (id: number) => {
    toggleCompletionMutation.mutate(id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <IconCheckboxCircle className="text-primary-600 text-2xl" />
              <h1 className="text-xl font-semibold text-slate-900">TodoApp</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList className="border-b border-slate-200 w-full justify-start">
              <TabsTrigger value="work" className="data-[state=active]:border-orange-500 data-[state=active]:text-orange-500">
                <IconBriefcase className="mr-2 h-4 w-4" />
                Work
              </TabsTrigger>
              <TabsTrigger value="personal" className="data-[state=active]:border-cyan-500 data-[state=active]:text-cyan-500">
                <IconUser className="mr-2 h-4 w-4" />
                Personal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="work" className="pt-4">
              <TodoHeader
                activeTab="work"
                totalTodos={filteredTodos.length}
                completedTodos={completedTodos}
                sortOption={sortOption}
                sortOptions={todoSortOptions}
                onSortChange={setSortOption}
                onNewTodo={handleNewTodo}
              />
              <TodoList
                todos={filteredTodos}
                activeTab="work"
                sortOption={sortOption}
                onTodoClick={handleViewTodo}
                onEditTodo={handleEditTodo}
                onDeleteTodo={handleDeleteTodo}
                onToggleComplete={handleToggleComplete}
                onNewTodo={handleNewTodo}
              />
            </TabsContent>

            <TabsContent value="personal" className="pt-4">
              <TodoHeader
                activeTab="personal"
                totalTodos={filteredTodos.length}
                completedTodos={completedTodos}
                sortOption={sortOption}
                sortOptions={todoSortOptions}
                onSortChange={setSortOption}
                onNewTodo={handleNewTodo}
              />
              <TodoList
                todos={filteredTodos}
                activeTab="personal"
                sortOption={sortOption}
                onTodoClick={handleViewTodo}
                onEditTodo={handleEditTodo}
                onDeleteTodo={handleDeleteTodo}
                onToggleComplete={handleToggleComplete}
                onNewTodo={handleNewTodo}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">
            TodoApp - Organize your work and personal tasks
          </p>
        </div>
      </footer>

      {/* Modals */}
      <TodoModal
        isOpen={todoModalOpen}
        todo={selectedTodo}
        activeTab={activeTab}
        onClose={() => setTodoModalOpen(false)}
        onSave={handleSaveTodo}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <ViewTodoModal
        isOpen={viewModalOpen}
        todo={selectedTodo}
        onClose={() => setViewModalOpen(false)}
        onEdit={() => {
          setViewModalOpen(false);
          setTodoModalOpen(true);
        }}
      />
    </div>
  );
}
