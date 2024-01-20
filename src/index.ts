import express from 'express';
import {routes} from './routes.js';

const app = express();
const port = process.env.PORT || 4000;

routes(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
