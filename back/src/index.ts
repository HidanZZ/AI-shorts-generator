// index.ts
import express from 'express';
import voiceRoutes from './routes/voiceRoute';

const app = express();
const port = 3000;

app.use(express.json());

// Load your routes
app.use('/', voiceRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
