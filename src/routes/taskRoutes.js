const express = require('express');
const router = express.Router();
const {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
  getReports,
} = require('../controllers/taskController');
const validateTask = require('../middleware/validateTask');

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

router.get('/tasks', listTasks);
router.post('/tasks', validateTask, createTask);
router.get('/tasks/:id', getTask);
router.put('/tasks/:id', validateTask, updateTask);
router.delete('/tasks/:id', deleteTask);
router.get('/reports/summary', getReports);

module.exports = router;
