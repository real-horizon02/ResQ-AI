import express from 'express';
import { getsos, createsos, updatesos, approvesos, deletesos } from '../controllers/sos_controller.js';

const route = express.Router();

route.get('/sos', getsos);
route.post('/sos', createsos);
route.put('/sos/:id', updatesos);
route.delete('/sos/:id', deletesos);
route.post('/sos/approve', approvesos);

export default route;