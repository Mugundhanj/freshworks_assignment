const express = require('express');

const app = express();
const productRouter=require('./routes/productRoutes');

app.use(express.json({ limit: '16kb' }));

app.use('/api/v1/products', productRouter);
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on the server`,
  });

});
  module.exports = app;