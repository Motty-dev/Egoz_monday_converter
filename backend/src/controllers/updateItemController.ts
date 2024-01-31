import { Request, Response } from 'express';

export const updateItem = async (req: Request, res: Response) => {
    console.log(JSON.stringify(req.body));
    res.status(200).send(req.body);
};