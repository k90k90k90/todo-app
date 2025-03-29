import { Todo } from '@/types/todo';
import { formatRelative } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { 
  IconCheckLine, 
  IconTimeLine, 
  IconEditLine, 
  IconCheckDoubleLine 
} from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

interface TodoItemProps {
  todo: Todo;
  category: 'work' | 'personal';
  onTodoClick: () => void;
  onEditTodo: () => void;
  onDeleteTodo: () => void;
  onToggleComplete: () => void;
}

export default function TodoItem({
  todo,
  category,
  onTodoClick,
  onEditTodo,
  onDeleteTodo,
  onToggleComplete
}: TodoItemProps) {
  const isCompleted = !!todo.completedAt;
  
  const formatDate = (dateString: string) => {
    try {
      return formatRelative(new Date(dateString), new Date());
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Prevent event bubbling for action buttons
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditTodo();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTodo();
  };

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete();
  };

  return (
    <Card 
      className={`overflow-hidden border-l-4 ${category === 'work' ? 'border-l-orange-500' : 'border-l-cyan-500'} hover:shadow-md transition-shadow duration-200 ${isCompleted ? 'opacity-70' : ''}`}
    >
      <CardContent className="p-0">
        <div className="flex items-start p-4">
          <div className="flex-shrink-0 pt-1">
            <Button
              variant="outline"
              size="icon"
              className={`w-5 h-5 rounded-full p-0 border-2 ${isCompleted ? 'border-green-500 bg-green-500' : 'border-slate-300'} flex items-center justify-center`}
              onClick={handleCompleteClick}
              aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
            >
              {isCompleted && <IconCheckLine className="text-white text-xs" />}
            </Button>
          </div>
          
          <div className="ml-3 flex-1 cursor-pointer" onClick={onTodoClick}>
            <div className="flex justify-between">
              <h3 className={`text-sm font-medium text-slate-900 ${isCompleted ? 'line-through' : ''}`}>
                {todo.title}
              </h3>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-slate-500 h-6 w-6"
                  onClick={handleEditClick}
                  aria-label="Edit todo"
                >
                  <IconEditLine className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-red-500 h-6 w-6"
                  onClick={handleDeleteClick}
                  aria-label="Delete todo"
                >
                  <IconTimeLine className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <p className={`mt-1 text-sm text-slate-500 line-clamp-2 ${isCompleted ? 'line-through' : ''}`}>
              {todo.description || ''}
            </p>
            
            <div className="mt-2 flex items-center text-xs text-slate-400">
              <span className="flex items-center">
                <IconTimeLine className="mr-1 h-3 w-3" />
                Created {formatDate(todo.createdAt)}
              </span>
              <span className="mx-1 text-slate-300">•</span>
              {isCompleted ? (
                <span className="flex items-center">
                  <IconCheckDoubleLine className="mr-1 h-3 w-3 text-green-500" />
                  Completed {formatDate(todo.completedAt!)}
                </span>
              ) : (
                <span className="flex items-center">
                  <IconEditLine className="mr-1 h-3 w-3" />
                  Updated {formatDate(todo.updatedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
