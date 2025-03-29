import { Todo } from '@/types/todo';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { IconBriefcase, IconUser, IconPencil } from '@/components/ui/icons';

interface ViewTodoModalProps {
  isOpen: boolean;
  todo: Todo | null;
  onClose: () => void;
  onEdit: () => void;
}

export default function ViewTodoModal({
  isOpen,
  todo,
  onClose,
  onEdit,
}: ViewTodoModalProps) {
  if (!todo) return null;
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not completed';
    try {
      return format(new Date(dateString), 'MMM d, yyyy \'at\' h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-medium">
              {todo.title}
            </DialogTitle>
            <Badge variant="outline" className={`${todo.category === 'work' ? 'bg-orange-100 text-orange-700' : 'bg-cyan-100 text-cyan-700'}`}>
              {todo.category === 'work' 
                ? <IconBriefcase className="mr-1 h-3 w-3" /> 
                : <IconUser className="mr-1 h-3 w-3" />
              }
              {todo.category.charAt(0).toUpperCase() + todo.category.slice(1)}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-slate-700">
            <p>{todo.description || 'No description provided.'}</p>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
            <div>
              <p className="font-medium text-slate-700 mb-1">Created</p>
              <p>{formatDate(todo.createdAt)}</p>
            </div>
            <div>
              <p className="font-medium text-slate-700 mb-1">Last Modified</p>
              <p>{formatDate(todo.updatedAt)}</p>
            </div>
            <div>
              <p className="font-medium text-slate-700 mb-1">Status</p>
              <div className="flex items-center">
                <span className={`h-2 w-2 rounded-full ${todo.completedAt ? 'bg-green-500' : 'bg-amber-400'} mr-1.5`}></span>
                <span>{todo.completedAt ? 'Completed' : 'In Progress'}</span>
              </div>
            </div>
            <div>
              <p className="font-medium text-slate-700 mb-1">Completed</p>
              <p>{formatDate(todo.completedAt)}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={onEdit}
          >
            <IconPencil className="mr-1 h-4 w-4" />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
