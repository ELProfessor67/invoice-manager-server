import express from 'express';
import {config} from 'dotenv';
import path from 'path';
import routes from './router.js';
import { connectDB } from './config/database.js';
const __dirname = path.resolve();
import cors from 'cors';

import cookieParser from "cookie-parser";


import errorMiddleware from './middlewares/error.js'

config({path: path.join(__dirname,'./config/config.env')});
export const app = express();
connectDB();


app.use(cookieParser());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
    cors({
      credentials: true,
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
);


app.use('',express.static(path.join(__dirname,'./public')));





//routes
app.use('/api/v1',routes)

app.use(errorMiddleware);
