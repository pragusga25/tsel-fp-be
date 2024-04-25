import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import { config as c } from 'dotenv';
import { config } from './__shared__/config';
import { routers } from './routers';
import { errorMiddleware } from './__middlewares__';

c();

const app: Express = express();
const port = config.PORT;

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

if (config.NODE_ENV == 'development') {
  process.on('uncaughtException', function (err) {
    console.log(err);
    //Send some notification about the error
    process.exit(1);
  });
}
