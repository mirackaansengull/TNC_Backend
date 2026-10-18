const {
  getTasks,
  addTask,
  getTaskById,
  updateTaskById,
  deleteTaskById,
} = require('../data/tasks');
const AppError = require('../utils/AppError');

const createTask = (req, res, next) => {
  try {
    const task = addTask(req.body);
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const listTasks = (req, res, next) => {
  try {
    const { status, priority, assignee, keyword, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let tasks = getTasks();

    if (status) {
      tasks = tasks.filter((task) => task.status === status);
    }

    if (priority) {
      tasks = tasks.filter((task) => task.priority === priority);
    }

    if (assignee) {
      tasks = tasks.filter((task) => task.assignee?.toLowerCase() === assignee.toLowerCase());
    }

    if (keyword) {
      const q = keyword.toLowerCase();
      tasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q)
      );
    }

    const sortedTasks = [...tasks].sort((a, b) => {
      const left = a[sortBy] ?? '';
      const right = b[sortBy] ?? '';
      const direction = sortOrder === 'asc' ? 1 : -1;
      if (typeof left === 'string' && typeof right === 'string') {
        return left.localeCompare(right) * direction;
      }
      return (Number(left) - Number(right)) * direction;
    });

    const totalItems = sortedTasks.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedTasks = sortedTasks.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: paginatedTasks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / Number(limit))),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTask = (req, res, next) => {
  try {
    const task = getTaskById(req.params.id);

    if (!task) {
      throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      message: 'Task details retrieved successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = (req, res, next) => {
  try {
    const task = updateTaskById(req.params.id, req.body);

    if (!task) {
      throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = (req, res, next) => {
  try {
    const deleted = deleteTaskById(req.params.id);

    if (!deleted) {
      throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getReports = (req, res, next) => {
  try {
    const tasks = getTasks();
    const completedTasks = tasks.filter((task) => task.status === 'completed').length;
    const pendingTasks = tasks.filter((task) => task.status !== 'completed').length;

    res.status(200).json({
      success: true,
      message: 'Reports fetched successfully',
      data: {
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        summary: `${completedTasks} completed / ${pendingTasks} pending`,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
  getReports,
};
