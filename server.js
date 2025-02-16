const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const cron = require('node-cron');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config();

const endpoint = process.env.ENDPOINT;
const key = process.env.KEY;

const app = express();
const server = http.createServer(app);

const io = new Server(server);

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

const checkApi = async () => {
  try {
    const response = await axios.get(`${endpoint}`);
    const jsonData = response.data;
    const requiredData = jsonData[key];

    // Condition
    if (requiredData > 0.1) {
      console.log('Condition met! Sending notification...');
      io.emit('notification', {
        message: 'The condition has been met!',
        value: requiredData,
      });
    } else {
      console.log('Value = ' + requiredData);
      console.log('Condition not met.');
    }
  } catch (error) {
    console.error('Error hitting the API:', error);
  }
};

cron.schedule('*/10 * * * * *', () => {
  console.log('Hitting the API...');
  checkApi();
});

io.on('connection', (socket) => {
  console.log('A user connected!');
  socket.on('disconnect', () => {
    console.log('A user disconnected!');
  });
});

const PORT = process.env.PORT || 10000; // Ensure process.env.PORT is used
server.listen(PORT, '0.0.0.0', () => {
  // Bind to 0.0.0.0 for external access
  console.log(`Server is running on port ${PORT}`);
});

// Schedule the task to run every 10 minutes
// cron.schedule('*/10 * * * *', () => {
//     console.log('Hitting the API...');
//     checkApi();
//   });
