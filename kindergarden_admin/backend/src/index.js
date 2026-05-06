const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const kindergartenRoutes = require('./routes/kindergartenRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/kindergartens', kindergartenRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Kindergarten Admin API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
