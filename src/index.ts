import express from 'express';
import helmet from 'helmet';
import { DBconnection } from './dbconfig';
import { cursorPaginatedData, insertData, offsetPaginatedData } from './services/InsertData.service';
import { testCursorPagination, testOffsetPagination } from './services/testPagination.service';

DBconnection.connect();
const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.disable('x-powered-by');

app.get('/', (_req, res) => {
  res.send('Hey it works. 🥳');
});

app.get('/performance/insert', insertData);
app.get('/paginate/offset', offsetPaginatedData);
app.get('/paginate/cursor', cursorPaginatedData);

app.get('/test/offset', testOffsetPagination);
app.get('/test/cursor', testCursorPagination);

app.listen(3000, () => {
  console.log(`Listening at port 3000`);
});
