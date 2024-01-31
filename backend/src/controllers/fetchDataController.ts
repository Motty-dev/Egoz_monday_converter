import { Request, Response } from 'express';
import { fetchDataFromBoard } from '../services/mondayService';

export const fetchData = async (req: Request, res: Response) => {
    try {
        const boardId = parseInt(req.params.boardId);
        if (isNaN(boardId)) {
            return res.status(400).send("Invalid board ID");
        }
        const data = await fetchDataFromBoard(boardId);
        res.json(data);
    } catch (error) {
        const errorMessage = (error as Error).message;
        res.status(500).send(errorMessage);
    }
};