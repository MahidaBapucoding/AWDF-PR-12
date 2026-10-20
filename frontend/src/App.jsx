import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getCurrentUser,
  logoutUser
} from './api.js';
import Spinner from './components/Spinner.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import { ToastContainer } from './components/Toast.jsx';

// Practical 8: Route-based Code Splitting using React.lazy()
const TasksPage = lazy(() => import('./pages/TasksPage.jsx'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'));

let toastIdCounter = 0;

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [creating, setCreating] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState(null);

  const [toasts, setToasts] = useState([]);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const navigate = useNavigate();

  const pushToast = useCallback((type, message) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check auth status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
        .then((res) => setCurrentUser(res.user))
        .catch(() => {
          localStorage.removeItem('token');
          setCurrentUser(null);
        });
    }
  }, []);

  // Listen for unauthorized events (e.g. token expired)
  useEffect(() => {
    const handleUnauthorized = () => {
      logoutUser();
      setCurrentUser(null);
      pushToast('error', 'Session expired. Please log in again.');
      navigate('/login');
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [navigate, pushToast]);

  // Load tasks
  const loadTasks = useCallback(() => {
    setLoading(true);
    setError(null);
    getTasks()
      .then((data) => setTasks(data))
      .catch((err) => {
        // If unauthenticated or token error, don't show full error box on task load
        if (!err.message.includes('Unauthorized')) {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Handle task creation
  const handleCreate = async (taskInput) => {
    setCreating(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = { ...taskInput, _id: tempId, completed: false, __optimistic: true };
    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      const savedTask = await createTask(taskInput);
      setTasks((prev) => prev.map((t) => (t._id === tempId ? savedTask : t)));
      pushToast('success', 'Task created successfully');
    } catch (err) {
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      pushToast('error', `Failed to create task: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Handle task updates
  const handleUpdate = async (id, updates) => {
    setBusyTaskId(id);
    try {
      const updatedTask = await updateTask(id, updates);
      setTasks((prev) => prev.map((t) => (t._id === id ? updatedTask : t)));
      pushToast('success', 'Task updated');
    } catch (err) {
      pushToast('error', `Failed to update task: ${err.message}`);
    } finally {
      setBusyTaskId(null);
    }
  };

  // Handle task deletion with confirmation
  const requestDelete = (task) => setConfirmTarget(task);
  const cancelDelete = () => setConfirmTarget(null);

  const confirmDelete = async () => {
    const task = confirmTarget;
    if (!task) return;
    setConfirmTarget(null);
    setBusyTaskId(task._id);
    try {
      await deleteTask(task._id);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
      pushToast('success', 'Task deleted');
    } catch (err) {
      pushToast('error', `Failed to delete task: ${err.message}`);
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    pushToast('info', 'Logged out');
    navigate('/login');
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    loadTasks();
    navigate('/');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div>
            <h1>Task Manager</h1>
            <p className="subtitle">React (5173) ⇄ Express/MongoDB (5000)</p>
          </div>

          <div className="user-area">
            {currentUser ? (
              <button className="btn btn-logout" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <NavLink to="/login" className="btn btn-secondary btn-sm">
                Login / Register
              </NavLink>
            )}
          </div>
        </div>

        {/* Practical 8: Navigation bar for lazy loaded routes */}
        <nav className="nav-tabs">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Tasks
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Projects
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Contact
          </NavLink>
        </nav>
      </header>

      {/* Practical 8: Suspense fallback wrapper around lazy-loaded routes */}
      <Suspense fallback={<Spinner label="Loading page..." />}>
        <Routes>
          <Route
            path="/"
            element={
              <TasksPage
                tasks={tasks}
                loading={loading}
                error={error}
                loadTasks={loadTasks}
                handleCreate={handleCreate}
                handleUpdate={handleUpdate}
                requestDelete={requestDelete}
                creating={creating}
                busyTaskId={busyTaskId}
              />
            }
          />
          <Route path="/projects" element={<ProjectsPage tasks={tasks} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/login"
            element={
              <AuthPage
                onAuthSuccess={handleAuthSuccess}
                pushToast={pushToast}
                initialMode="login"
              />
            }
          />
          <Route
            path="/register"
            element={
              <AuthPage
                onAuthSuccess={handleAuthSuccess}
                pushToast={pushToast}
                initialMode="register"
              />
            }
          />
        </Routes>
      </Suspense>

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete task?"
        message={
          confirmTarget
            ? `Are you sure you want to delete "${confirmTarget.title}"? This cannot be undone.`
            : ''
        }
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
