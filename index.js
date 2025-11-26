const express = require('express');
const app = express();
app.use(cors());
const winston=require('winston')
const cors=require('cors')
const generationMix=require('./routes/generationMix')
const logger=winston.createLogger({
    
    format: winston.format.simple(),
    transports: [
    new winston.transports.Console()
  ]
})
const port = process.env.PORT || 10000;
// app.use(cors({
//   origin:"https://generation-mix-frontend.onrender.com",
//   methods: ['GET','POST']
// }))
app.use('/api',generationMix)
const server=app.listen(port, () => logger.info(`Listening on port ${port}...`));

module.exports=server


