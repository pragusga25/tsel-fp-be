import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import { config as c } from 'dotenv';
import { routers } from './routers';
import { errorMiddleware } from './__middlewares__';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './__shared__/config';
c();

const app: Express = express();
const port = config.PORT || 8080;
console.log('process.env: ', process.env);

app.use(
  cors({
    origin: config.CORS_ORIGINS.split(','), // allow multiple origins
    credentials: true,
  })
);
app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.use('/api/v1', ...routers);
app.use(errorMiddleware);
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
