let tasks = [
  {
    id: 1,
    title: 'Initial task',
    description: 'Example task created for demo purposes',
    status: 'todo',
    priority: 'medium',
    assignee: 'Admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let nextId = 2;

const getTasks = () => tasks;

const setTasks = (newTasks) => {
  tasks = newTasks;
};

const addTask = (taskData) => {
  const newTask = {
    id: nextId++,
    ...taskData,
    status: taskData.status || 'todo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  return newTask;
};

const getTaskById = (id) => tasks.find((task) => task.id === Number(id));

const updateTaskById = (id, updates) => {
  const index = tasks.findIndex((task) => task.id === Number(id));

  if (index === -1) {
    return null;
  }

  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return tasks[index];
};

const deleteTaskById = (id) => {
  const index = tasks.findIndex((task) => task.id === Number(id));

  if (index === -1) {
    return false;
  }

  tasks.splice(index, 1);
  return true;
};

module.exports = {
  getTasks,
  setTasks,
  addTask,
  getTaskById,
  updateTaskById,
  deleteTaskById,
};
