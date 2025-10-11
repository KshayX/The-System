import './instrumentation';
import { createServer } from './server';

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const app = createServer();

app.listen(port, () => {
  console.log(`Real Life Solo Leveling System API listening on port ${port}`);
});
