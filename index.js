const express = require('express');
const app = express();
const winston=require('winston')
const cors=require('cors')
const generationMix=require('./routes/generation_mix')
const logger=winston.createLogger({
    
    format: winston.format.simple(),
    transports: [
    new winston.transports.Console()
  ]
})
const port = process.env.PORT || 3000;
app.use(cors({
  origin:"http://localhost:5173",
  methods: ['GET','POST']
}))
app.use('/api',generationMix)
const server=app.listen(port, () => logger.info(`Listening on port ${port}...`));

module.exports=server


