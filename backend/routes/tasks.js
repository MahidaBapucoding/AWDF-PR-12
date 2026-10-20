const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');
const { validateTask } = require('../middleware/validate');

// Protect all task routes (Practical 7)
router.use(protect);

// GET /tasks - get all tasks for the logged-in user (or all tasks)
router.get('/', async (req, res, next) => {
  try {
    const filter = req.user ? { user: req.user.id } : {};
    // If no tasks exist for user, fallback to returning all tasks or user tasks
    let tasks = await Task.find(filter).sort({ createdAt: -1 });
    if (tasks.length === 0 && req.user) {
      // Return general tasks if user has none yet
      tasks = await Task.find({ $or: [{ user: req.user.id }, { user: { $exists: false } }] }).sort({ createdAt: -1 });
    }
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id - get a single task by ID
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Task not found' });
    }
    next(err);
  }
});

// POST /tasks - create a task
router.post('/', validateTask, async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    const task = await Task.create({
      title,
      description,
      completed,
      priority,
      user: req.user ? req.user.id : undefined
    });
    res.status(201).json(task);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// PUT /tasks/:id - update a task
router.put('/:id', async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, completed, priority },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Task not found' });
    }
    next(err);
  }
});

// DELETE /tasks/:id - delete a task
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted', id: req.params.id });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Task not found' });
    }
    next(err);
  }
});

module.exports = router;
