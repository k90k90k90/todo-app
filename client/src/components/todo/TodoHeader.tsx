import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { IconPlus, IconBriefcase, IconUser } from '@/components/ui/icons';
import { TodoSortOption } from '@/types/todo';

interface TodoHeaderProps {
  activeTab: string;
  totalTodos: number;
  completedTodos: number;
  sortOption: string;
  sortOptions: TodoSortOption[];
  onSortChange: (value: string) => void;
  onNewTodo: () => void;
}

export default function TodoHeader({
  activeTab,
  totalTodos,
  completedTodos,
  sortOption,
  sortOptions,
  onSortChange,
  onNewTodo
}: TodoHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
          <span className={activeTab === 'work' ? 'text-orange-500' : 'text-cyan-500'}>
            {activeTab === 'work' ? 'Work' : 'Personal'}
          </span> Tasks
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {completedTodos} of {totalTodos} tasks completed
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
        <Select 
          value={sortOption} 
          onValueChange={onSortChange}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          onClick={onNewTodo}
          className="flex items-center justify-center"
        >
          <IconPlus className="mr-1 h-4 w-4" />
          New Task
        </Button>
      </div>
    </div>
  );
}
