const express = require('express');
const http = require('http'); // Required for socket.io
const cors = require('cors');
const path = require('path');

const app = require('./app');
const connectDb = require('./config/connectDb');
const { startFeeUpdateCronJob } = require('./services/feeService');
const patientRoutes = require('./routes/patientRoutes'); // Import the function, not router

// === Setup HTTP Server and Socket.IO ===
const server = http.createServer(app); // Use http server with express app
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*', // or specific domain like 'http://localhost:3000'
    methods: ['GET', 'POST']
  }
});

app.use(express.static(path.join(__dirname, '../dist')));
const moment = require('moment-timezone');

// === Timezone Middleware ===
app.use((req, res, next) => {
  // Attach both formatted string and raw moment object
  req.currentTime = moment().tz('Africa/Nairobi');
  req.currentTimeString = req.currentTime.format('YYYY-MM-DD HH:mm:ss');
  next();
});

// === Enable CORS ===
app.use(cors());

// === Connect DB ===
connectDb;

// === Start the cron job ===
startFeeUpdateCronJob();

// Now inject io into patient routes 👇
app.use('/api/patients', patientRoutes(io));

// === Static File Serving ===
app.use('/images', express.static(path.join(__dirname, 'uploads', 'images'), {
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  }
}));

app.use('//uploads/logo', express.static(path.join(__dirname, 'uploads', 'logo'), {
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  }
}));

io.on('connection', (socket) => {
  console.log('✅ Socket connected:', socket.id);

  socket.on('register-role', (role) => {
    console.log(`Socket ${socket.id} registered as ${role}`);
    socket.join(role); // ✅ Add socket to a room based on role
  });

});

io.on('disconnect', () => {
  console.log('Client disconnected');
});



// === Start Server ===
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
