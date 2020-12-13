const fetch = require("node-fetch");

const API_KEY = "";
const BASE_PATH = "https://home.sensibo.com/api/v2";

const URLS = {
  PODS: () => `${BASE_PATH}/users/me/pods?apiKey=${API_KEY}`,
  DEVICE_INFO: (id, fields) =>
    `${BASE_PATH}/pods/${id}?apiKey=${API_KEY}&fields=${fields.join(",")}`
};

const getData = async url => {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.log(error);
  }
};

const getSensiboData = async () => {
  const { result: pods } = await getData(URLS.PODS());

  const podData = await Promise.all(
    pods.map(async ({ id }) => {
      const {
        result: {
          room: { name },
          measurements: { temperature, humidity }
        }
      } = await getData(URLS.DEVICE_INFO(id, ["room", "measurements"]));

      return { name, temperature, humidity };
    })
  );

  console.log(podData);
};

getSensiboData();

// const getDevices = async () => {
//     const response = await fetch(`${BASE_PATH}/users/me/pods?apiKey=${API_KEY}`);
//     const json = await response.json();

//     return json;
// }

// const devices = getDevices();

// console.log({ devices });
