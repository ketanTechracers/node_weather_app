const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const WeatherRoutes = require("./weather.js");
const port = process.env.PORT || 3000;

//setting views and view engine
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// adding routes and middlewares
app.use(bodyParser.json());
app.use("/weather", WeatherRoutes);
app.get('/', (req, res) =>
  res.render('pages/index')
  // res.send('<h2>My Weather Bot</h2>' +
  //   '<iframe width="350" height="430" src="https://console.api.ai/api-client/demo/embedded/ketan-saxena-weather-bot"></iframe>'
  // )
);

//starting the App
app.listen(port, () => console.log('app running at localhost:' + port));
