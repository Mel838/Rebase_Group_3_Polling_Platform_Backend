import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import helmet from "helmet";
import cors from "cors";

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(helmet())
app.use(cors({
  origin: ["http://localhost:4000", "frontendapp.vercel.app"]
}))

app.use('/', indexRouter);
app.use('/users', usersRouter);