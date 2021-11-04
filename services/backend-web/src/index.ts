import helloFunc from '@white-rabbit/backend';
import express, { Application, Request, Response } from 'express';
import winston from 'winston';

const app: Application = express();
const port = process.env.NODE_ENV === 'production' ? 80 : 3000;

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (_req: Request, res: Response) => res.status(200).send({ message: helloFunc() }));

try {
  app.listen(port, (): void => {
    winston.info(`Connected successfully on port ${port}`);
  });
} catch (error: unknown) {
  winston.error(`Error occurred: ${error}`);
}
