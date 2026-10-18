const express = require('express');
const config = require('./src/config');
const logger = require('./src/middleware/logger');
const errorHandler = require('./src/middleware/errorHandler');
const notFound = require('./src/middleware/notFound');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();

app.use(express.json());
app.use(logger);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow API is running',
    app: config.APP_NAME,
    environment: config.ENV,
    version: '1.0.0',
  });
});

app.use(taskRoutes);
app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`${config.APP_NAME} running on http://localhost:${config.PORT}`);
  });
}

module.exports = app;
