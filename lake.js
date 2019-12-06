const appkey = "c1ea699f2c137c3121712ac090907294";

class Lake {
  constructor(lon, lat, name) {
    this.lon = lon;
    this.lat = lat;
    this.name = name;

  }
}

const lakes = {
  "Kisajno": new Lake(21.701493, 54.06592, "Kisajno"),
  "Warnolty": new Lake(21.633747, 53.712741, "Warnołty"),
  "Jeziorak": new Lake(19.5753, 53.649835, "Jeziorak"),
  "Pilakno": new Lake(21.161813, 53.787905, "Piłakno"),
  "Krutynskie": new Lake(21.432507, 53.704958, "Krutyńskie")
}

class DataWeather {
  constructor(json_data) {
    this.temp = json_data["main"]["temp"].toString().concat("°C");
    this.wind_speed = "Wind " + json_data["wind"]["speed"].toString() + "km/h";
    this.sunrise = "Sunrise " + convertToTime(json_data["sys"]["sunrise"]);
    this.sunset = "Sunset " + convertToTime(json_data["sys"]["sunset"]);
    this.icon = json_data["weather"][0]["icon"];
    this.icon = "http://openweathermap.org/img/wn/" + this.icon + "@2x.png";
    this.icon = '<img src="' + this.icon + '"></img>';

  }
}

class DataFutureWeather {
  constructor(json_data) {
    this.temp = json_data["main"]["temp"].toString().concat("°C");
    this.icon = json_data["weather"][0]["icon"];
    this.icon = "http://openweathermap.org/img/wn/" + this.icon + "@2x.png";
    this.icon = '<img src="' + this.icon + '"></img>';
    this.hour = convertToTime(json_data["dt"]);
    this.date = convertToDate(json_data["dt"]);
    this.dt = json_data["dt_txt"];

  }
}

function convertToTime(unixtime) {
  let date = new Date(unixtime * 1000);
  let hours = date.getHours();
  let minutes = "0" + date.getMinutes();
  let formattedTime = hours + ':' + minutes.substr(-2);
  return formattedTime;
}

function convertToDate(unixtime) {
  let date = new Date(unixtime * 1000);
  let formattedMonth = date.getMonth() + 1;
  let formattedDate = date.getDate()
  let dateString = formattedDate.toString() + "." + formattedMonth.toString()
  return dateString
}


class OpenWeather {
  constructor(appid) {
    this.basic_url = "https://api.openweathermap.org/data/2.5";
    this.future_endpoint = "/forecast?";
    this.current_endpoint = "/weather?";
    this.key = appid;
  }

  async getLocationWeatherNow(lon, lat) {
    let url_request = this.basic_url.concat(
      this.current_endpoint,
      "lat=",
      lat,
      "&",
      "lon=",
      lon,
      "&APPID=",
      appkey,
      "&units=metric"
    );
    let data = await fetch(url_request)
      .then(response => response.json())
      .then(data => {

        let locationObject = new DataWeather(data);
        return locationObject;
      })
      .catch(error => {
        console.log(error);
      });
    return data;
  }

  async getLocationWeatherFuture(lon, lat) {
    let url_request = this.basic_url.concat(
      this.future_endpoint,
      "lat=",
      lat,
      "&",
      "lon=",
      lon,
      "&APPID=",
      appkey,
      "&units=metric"
    );
    let data = await fetch(url_request)
      .then(response => response.json())
      .then(data => {

        let weatherpoints = data.list;
        let output = [];
        for (let i = 0; i < 5; i++) {
          output.push(new DataFutureWeather(weatherpoints[i]));
        }

        return output;

      })
      .catch(error => {
        console.log(error);
      });
    return data;
  }

  async getNextDayWeather(lon, lat) {
    let url_request = this.basic_url.concat(
      this.future_endpoint,
      "lat=",
      lat,
      "&",
      "lon=",
      lon,
      "&APPID=",
      appkey,
      "&units=metric"
    );
    let data = await fetch(url_request)
      .then(response => response.json())
      .then(data => {

        let weatherpoints = data.list;
        let output = [];

        for (let i = 0; i < weatherpoints.length; i++) {

          let datapoint = new DataFutureWeather(weatherpoints[i]);

          if (datapoint.hour === "13:00") {
            output.push(datapoint);

          }
        }
        return output;
      })
      .catch(error => {
        console.log(error);
      });
    return data;
  }
}

weatherApi = new OpenWeather(appkey);
console.log(OpenWeather)
weatherApi.getNextDayWeather(21.701493, 54.06592);
console.log(getLocationDayWeather);


async function generateWeather() {

  let url = document.location.href;
  let lakename = url.split("=")[1];

  let selectedlake = lakes[lakename];
  document.getElementById("lakename").innerText = selectedlake.name;
  let weatherApi = new OpenWeather(appkey);
  let weatherObject = await weatherApi.getLocationWeatherNow(selectedlake.lon, selectedlake.lat);
  document.getElementById("nowtemp").innerText = weatherObject.temp;
  document.getElementById("windspeed").innerText = weatherObject.wind_speed;
  document.getElementById("sun").innerHTML = weatherObject.sunrise + " </br> " + weatherObject.sunset;
  document.getElementById("mainicon").innerHTML = weatherObject.icon;
  let fivehours = await weatherApi.getLocationWeatherFuture(selectedlake.lon, selectedlake.lat);

  let html_output = [];
  for (let i = 0; i < fivehours.length; i++) {
    let element = fivehours[i];
    let temp = element.temp;
    let hour = element.hour;
    let icon = element.icon;
    let oneHour = `<div class="widgetcontent"><div class="weathertxt" class="temperature">${hour}</div><div class="temperature"> ${icon} </div><div class="temperature"> ${temp} </div></div>`
    html_output.push(oneHour);
  }
  html_output = html_output.join("");
  document.getElementById("hourlyweather").innerHTML = html_output;

}

function clickNextDays() {
  let url = document.location.href;
  let lakename = url.split("?")[1];
  let url_href = "nextdays.html?" + lakename;
  window.location.href = url_href;
}

function clickCurrentDay() {
  let url = document.location.href;
  let lakename = url.split("?")[1];
  let url_href = "weather.html?" + lakename;
  window.location.href = url_href;
}

async function generateDaysWeather() {
  let url = document.location.href;
  let lakename = url.split("=")[1];
  let selectedlake = lakes[lakename];
  document.getElementById("lakename").innerText = selectedlake.name;
  let weatherApi = new OpenWeather(appkey);
  let weatherObject = await weatherApi.getLocationWeatherNow(selectedlake.lon, selectedlake.lat);
  document.getElementById("nowtemp").innerText = weatherObject.temp;
  document.getElementById("windspeed").innerText = weatherObject.wind_speed;
  document.getElementById("sun").innerHTML = weatherObject.sunrise + " </br> " + weatherObject.sunset;
  document.getElementById("mainicon").innerHTML = weatherObject.icon;
  let fivedays = await weatherApi.getNextDayWeather(selectedlake.lon, selectedlake.lat);
  let html_output = [];
  for (let i = 0; i < fivedays.length; i++) {
    let element = fivedays[i];
    let temp = element.temp;
    let date = element.date;
    let icon = element.icon;
    let oneDay = `<div class="widgetcontent">
                        <div class="temperature">${date}</div>
                        <div class="temperature">${icon}</div>
                        <div class="temperature">${temp}</div>
                    </div>`
    html_output.push(oneDay);
  }
  html_output = html_output.join("");
  document.getElementById("weekdaysweather").innerHTML = html_output;
}