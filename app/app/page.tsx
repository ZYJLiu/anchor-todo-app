import CreateTask from "@/components/create-task";
import TaskList from "@/components/task-list";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <CreateTask />
      <TaskList />
    </div>
  );
}
