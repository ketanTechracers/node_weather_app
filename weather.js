const express = require("express");
const router = express.Router();
const request = require('request');
const config = require("./config");
const moment = require("moment");
const baseUrl = 'http://api.worldweatheronline.com/premium/v1';
const apiKey = config.weather.api_key;

const getResponse = (response) => ({ displayText: response, speech: response });

router.post('/', (req, res) => {
  let params = req.body.result && req.body.result.parameters;
  console.log(params);
  params['date-period'] ? getWeatherForDuration(params, res) : getWeatherForDay(params, res);
});

function getWeatherForDuration(params, res) {
  const dates = params['date-period'].split('/').map(date => moment(date, 'YYYY-MM-DD'));
  const daysCount = dates[1].diff(dates[0], 'days');
  const city = params['geo-city'] || 'indore';
  const date = dates[0].format('YYYY-MM-DD');
  let endpoint = API.weatherForecast;
  let now = moment();
  let tenseForm = 'are';
  if(dates[0].isBefore(now, 'day')) {
    endpoint = API.pastWeather;
    tenseForm = 'were';
  }
  if(dates[0].isAfter(now, 'day'))
    tenseForm = 'would be';

  _callWeatherAPI(endpoint, { date, city, daysCount })
   .then(response => {

      const forecast = response['data']['weather'][0];
      const location = response['data']['request'][0];
      const conditions = response['data']['current_condition'] && response['data']['current_condition'][0];
      const currentConditions = conditions && conditions['weatherDesc'] &&
        conditions['weatherDesc'][0] && conditions['weatherDesc'][0]['value'];
      const weatherType = params['Weather-type'];

      const output = `Weather conditions in `+
        `${location['query'].split(',')[0]} between ${dates[0].format('DD MMM')}` +
        ` and ${dates[1].format('DD MMM')} ` +
        `${tenseForm} ${currentConditions} with a projected high of ` +
        `${forecast['maxtempC']}°C or ${forecast['maxtempF']}°F and a low of ` +
        `${forecast['mintempC']}°C or ${forecast['mintempF']}°F.`;

      res.status(200).json(getResponse(output));
    })
    .catch(error => {
       console.error(error);
       res.status(400).send(getResponse(error))
     });
}

function getWeatherForDay (params, res) {
  const city = params['geo-city'] || 'indore';
  const date = params.date || moment().format('YYYY-MM-DD');
  let givenDate = params.date ? moment(params.date, 'YYYY-MM-DD') : moment();
  let now = moment();
  let endpoint = API.weatherForecast;
  let tenseForm = 'are';
  if(givenDate.isBefore(now, 'day'))
    tenseForm = 'were';
  if(givenDate.isAfter(now, 'day'))
    tenseForm = 'would be';
  _callWeatherAPI(endpoint, { date, city })
   .then(response => {
      const forecast = response['data']['weather'][0];
      const location = response['data']['request'][0];
      const conditions = response['data']['current_condition'] && response['data']['current_condition'][0];
      const currentConditions = conditions && conditions['weatherDesc'] &&
        conditions['weatherDesc'][0] && conditions['weatherDesc'][0]['value'];
      const output = `Weather conditions in `+
        `${location['query'].split(',')[0]} on ${givenDate.format('DD MMM')} ` +
        `${tenseForm} ${currentConditions} with a projected high of ` +
        `${forecast['maxtempC']}°C or ${forecast['maxtempF']}°F and a low of ` +
        `${forecast['mintempC']}°C or ${forecast['mintempF']}°F.`;

      res.status(200).json(getResponse(output));
    })
   .catch(error => {
      console.error(error);
      res.status(400).send(getResponse(error))
    });
}

const _callWeatherAPI = (endpoint, params = {}) => new Promise((resolve, reject) => {
  const city = params.city || 'indore';
  const date = params.date || 'today';
  const daysCount = params.daysCount || 1;
  const url = `${baseUrl}/${endpoint}?format=json&num_of_days=${daysCount}` +
    `&q=${city}&key=${apiKey}&date=${date}`;
  console.log('[HTTP GET]: '+url);
  request.get(url, (error, result, body) => {
    error ? reject(error) : resolve(JSON.parse(body));
  });
});

const API = {
  weatherForecast: 'weather.ashx',
  pastWeather: 'past-weather.ashx'
}
module.exports = router;
