import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';

import express , { Request, Response , NextFunction} from 'express';
import processedDataRoute from './routes/processedDataRoute';
import updateItemRoute from './routes/updateItemRoute';
import fetchDataRoute from './routes/fetchDataRoute';
import eventsRoute from './routes/eventsRoute';
import tableUpdaterRoute from './routes/tableUpdaterRoute';
import { runStartup } from './startup';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/api', processedDataRoute);
app.use('/api', updateItemRoute);
app.use('/api', fetchDataRoute);
app.use('/api', eventsRoute);
app.use('/api', tableUpdaterRoute);

app.use((err: any , req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, async () => {
  try {
    console.log(`Server running on http://localhost:${port}`);
    await runStartup(); 
  } catch (error) {
    console.error('Error during startup:', error);
  }
});