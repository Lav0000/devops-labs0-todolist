export interface Todo {
  id: number;
  task: string;
  completed: boolean;
  dueDate?: string | null;
}
