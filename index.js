import express from 'express';
import { pool } from './db.js';
import cors from 'cors';


const app = express();
const PORT = 3000;

// Middleware: allows Express to read JSON request bodies
app.use(express.json());


app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
}));
// ==================================
// HOME ROUTE
// ==================================

app.get('/', (req, res) => {
    res.send('Welcome to my Task Management API!');
});


// ==================================
// GET ALL TASKS
// ==================================


app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM tasks ORDER BY id ASC'
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Failed to fetch tasks:', error.message);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// ==================================
// GET ONE TASK BY ID
// ==================================


app.get('/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            error: 'Invalid task ID'
        });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM tasks WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Failed to fetch task:', error.message);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// ==================================
// CREATE A NEW TASK
// ==================================


app.post('/tasks', async (req, res) => {
    const { title } = req.body;

    if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
            error: 'A valid title is required'
        });
    }

    try {
        const result = await pool.query(
            'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
            [title.trim()]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Failed to create task:', error.message);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// UPDATE AN EXISTING TASK


app.patch('/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { title, completed } = req.body;

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            error: 'Invalid task ID'
        });
    }

    if (title === undefined && completed === undefined) {
        return res.status(400).json({
            error: 'Provide a title or completed value to update'
        });
    }

    if (
        title !== undefined &&
        (typeof title !== 'string' || !title.trim())
    ) {
        return res.status(400).json({
            error: 'Title must be a non-empty string'
        });
    }

    if (
        completed !== undefined &&
        typeof completed !== 'boolean'
    ) {
        return res.status(400).json({
            error: 'Completed must be true or false'
        });
    }

    try {
        const result = await pool.query(
            `UPDATE tasks
             SET title = COALESCE($1, title),
                 completed = COALESCE($2, completed)
             WHERE id = $3
             RETURNING *`,
            [
                title === undefined ? null : title.trim(),
                completed === undefined ? null : completed,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Failed to update task:', error.message);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// DELETE A TASK

app.delete('/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            error: 'Invalid task ID'
        });
    }

    try {
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        res.status(200).json({
            message: 'Task deleted successfully',
            task: result.rows[0]
        });
    } catch (error) {
        console.error('Failed to delete task:', error.message);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// ==================================
// START THE SERVER
// ==================================


app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    message: 'Internal server error',
  });
});


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});