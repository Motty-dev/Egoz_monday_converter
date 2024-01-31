import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';

import express , { Request, Response , NextFunction} from 'express';
import processedDataRoute from './routes/processedDataRoute';
import updateItemRoute from './routes/updateItemRoute';
import fetchDataRoute from './routes/fetchDataRoute';
import eventsRoute from './routes/eventsRoute';
import { runStartup } from './startup';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/api', processedDataRoute);
app.use('/api', updateItemRoute);
app.use('/api', fetchDataRoute);
app.use('/api', eventsRoute);

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







// import dotenv from 'dotenv';
// dotenv.config();
// import express from 'express';
// import WebSocket, { WebSocketServer } from 'ws';
// import { fetchDataFromBoard } from './services/mondayService';
// import { processDonations, ProcessedData } from './services/dataProcessor';

// const app = express();
// const port = process.env.PORT || 3000;
// app.use(express.json());


// let processedDataCache: ProcessedData | null = null;

// const wss = new WebSocketServer({ noServer: true });  


// wss.on('connection', (ws) => {
//   ws.on('message', (message) => {
//       console.log('Received message:', message);
//   });
//   ws.send('Connected to WebSocket');
// });

// // Serve the initial processed data via this endpoint
// app.get('/api/processed-data', (req, res) => {
//   if (!processedDataCache) {
//       return res.status(404).send('Data not processed yet');
//   }
//   res.json(processedDataCache);
// });

// // Endpoint for Monday.com to call when a new item is added
// app.post('/update-item', async (req, res) => {
//   // try {
//       console.log(JSON.stringify(req.body));
//       res.status(200).send(req.body);
 
// });

// app.get('/fetch-data/:boardId', async (req, res) => {
//     try {
//         const boardId = parseInt(req.params.boardId);
//         const data = await fetchDataFromBoard(boardId);
//         res.json(data);
//     } catch (error) {
//         const errorMessage = (error as Error).message;
//         res.status(500).send(errorMessage);
//     }
//   });

// app.listen(port, async () => {
//   console.log(`Server running on http://localhost:${port}`);
//   try {
//     const boardId = parseInt(process.env.BOARD_ID || "0");
//     console.log(boardId);

//     if (!boardId) {
//       throw new Error("BOARD_ID is not defined or not a number");
//     }
//     const initialData = await fetchDataFromBoard(boardId);
//     const processedData: ProcessedData = await processDonations(initialData);
//     console.log("TotalILS:   " + Math.round(processedData.totalILS).toLocaleString() + " ₪");

//     // Store processedData for WebSocket communication
//   } catch (error) {
//     console.error("Error fetching and processing initial data:", error);
//   }
// });
