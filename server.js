const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const WeatherRoutes = require("./weather.js");
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use("/weather", WeatherRoutes);
app.get('/', (req, res) =>
  response.send('<h2>My node app is running at port '+ port +'</h2>'));

app.listen(port, () => console.log('app running at localhost:' + port));
