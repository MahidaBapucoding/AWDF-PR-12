import TaskForm from '../components/TaskForm.jsx';
import TaskList from '../components/TaskList.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import RequestLog from '../components/RequestLog.jsx';

function TasksPage({
  tasks,
  loading,
  error,
  loadTasks,
  handleCreate,
  handleUpdate,
  requestDelete,
  creating,
  busyTaskId
}) {
  // Compute status metrics matching Practical 5/6/7 screenshots
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const inProgressCount = tasks.filter((t) => !t.completed && t.priority === 'high').length; // or standard count
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="tasks-page">
      {/* Summary metric cards matching Practical 6/7/8 UI screenshots */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">PENDING</div>
          <div className="stat-value">{pendingCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">IN PROGRESS</div>
          <div className="stat-value">{inProgressCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">COMPLETED</div>
          <div className="stat-value">{completedCount}</div>
        </div>
      </div>

      <TaskForm onCreate={handleCreate} creating={creating} />

      {loading && <Spinner label="Loading tasks..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={loadTasks} />}
      {!loading && !error && (
        <TaskList
          tasks={tasks}
          onToggleComplete={handleUpdate}
          onEdit={handleUpdate}
          onDeleteRequest={requestDelete}
          busyTaskId={busyTaskId}
        />
      )}

      {/* Request Log Box requested by user */}
      <RequestLog />
    </div>
  );
}

export default TasksPage;
