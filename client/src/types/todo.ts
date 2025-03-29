export type TodoCategory = 'work' | 'personal';

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  category: TodoCategory;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface NewTodo {
  title: string;
  description?: string;
  category: TodoCategory;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  category?: TodoCategory;
  completedAt?: string | null;
}

export interface TodoSortOption {
  label: string;
  value: string;
}

export const todoSortOptions: TodoSortOption[] = [
  { label: 'Newest first', value: 'dateCreated-desc' },
  { label: 'Oldest first', value: 'dateCreated-asc' },
  { label: 'Completion status', value: 'completed' },
  { label: 'Alphabetical', value: 'title' },
];

export const sortTodos = (
  todos: Todo[],
  sortOption: string
): Todo[] => {
  const sortedTodos = [...todos];

  switch (sortOption) {
    case 'dateCreated-desc':
      return sortedTodos.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'dateCreated-asc':
      return sortedTodos.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case 'completed':
      return sortedTodos.sort((a, b) => {
        if (a.completedAt === null && b.completedAt !== null) return 1;
        if (a.completedAt !== null && b.completedAt === null) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    case 'title':
      return sortedTodos.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sortedTodos;
  }
};
