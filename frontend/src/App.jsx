import { useEffect, useState } from 'react';
import './App.css';
import { getTasks, createTask, updateTask, deleteTask } from './api';



function App() {
  const [title, setTitle] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  

  // Load tasks from the backend when the component mounts.
  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (error) {
        setError('Could not load tasks. Please try again.');
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    }
     
    loadTasks();
  }, []);

  // Add a task to the local React state.
  async function handleSubmit(event) {
  event.preventDefault();
  if (submitting) return;

  if (!title.trim()) {
    return;
  }

  setSubmitting(true);

  try {
    const newTask = await createTask(title.trim());

    setTasks((currentTasks) => [...currentTasks, newTask]);
    setTitle('');
    setError('');
  } catch (error) {
    console.error('Failed to create task:', error);
    setError('Could not create task. Please try again.');
  }
  finally {
  setSubmitting(false);
}
}
  // Toggle a task's completion status.
  async function toggleTask(id) {
  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return;
  }

  try {
    const updatedTask = await updateTask(id, {
      completed: !task.completed,
    });

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === id ? updatedTask : currentTask
      )
    );

    setError('');
  } catch (error) {
    console.error('Failed to update task:', error);
    setError('Could not update task. Please try again.');
  }
}

async function toggleTask(id) {
  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return;
  }

  try {
    const updatedTask = await updateTask(id, {
      completed: !task.completed,
    });

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === id ? updatedTask : currentTask
      )
    );

    setError('');
  } catch (error) {
    console.error('Failed to update task:', error);
    setError('Could not update task. Please try again.');
  }
}

  // Delete a task from the local React state.
async function handleDeleteTask(id) {
  try {
    await deleteTask(id);

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id)
    );

    setError('');
  } catch (error) {
    console.error('Failed to delete task:', error);
    setError('Could not delete task. Please try again.');
  }
}

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingCount = tasks.filter(
    (task) => !task.completed
  ).length;

  return (
    <div className="app">
      <header className="header">
        <h1>Task Manager</h1>
        <p>Keep track of what matters.</p>
      </header>

      <main className="task-container">
        <section className="task-summary">
          <div className="summary-card">
            <h2>Total Tasks</h2>
            <p>{tasks.length}</p>
          </div>

          <div className="summary-card">
            <h2>Completed</h2>
            <p>{completedCount}</p>
          </div>

          <div className="summary-card">
            <h2>Pending</h2>
            <p>{pendingCount}</p>
          </div>
        </section>

        <section className="task-section">
          <h2>My Tasks</h2>

          <form className="task-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="What needs to be done?"
              aria-label="Task title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <button type="submit" disabled={submitting}>
  {submitting ? 'Adding...' : 'Add Task'}
</button>
          </form>

          {loading ? (
            <p className="empty-message">Loading tasks...</p>
          ) : error ? (
            <p className="empty-message">{error}</p>
          ) : tasks.length === 0 ? (
            <p className="empty-message">
              No tasks yet. Add your first task!
            </p>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`task-item ${
                    task.completed ? 'completed' : ''
                  }`}
                >
                  <label className="task-label">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />

                    <span>{task.title}</span>
                  </label>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;