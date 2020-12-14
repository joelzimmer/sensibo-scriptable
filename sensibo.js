// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: magic-wand;

const API_KEY = "";
const BASE_PATH = "https://home.sensibo.com/api/v2";

const URLS = {
  PODS: () => `${BASE_PATH}/users/me/pods?apiKey=${API_KEY}`,
  DEVICE_INFO: (id, fields) =>
    `${BASE_PATH}/pods/${id}?apiKey=${API_KEY}&fields=${fields.join(",")}`
};

const getData = async url => {
  const request = new Request(url);
  const response = await request.loadJSON();
  return response;
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

  return podData;
};

async function run() {
  const listWidget = new ListWidget();
  listWidget.setPadding(10, 10, 10, 10);

  try {
    const sensiboData = await getSensiboData();

    if (!sensiboData) {
      throw "No Data.";
    }

    console.log({ sensiboData });

    const textColor = Color.dynamic(
      new Color('313131'),
      new Color('ffffff')
    )

    sensiboData.forEach(({ name, temperature, humidity }) => {
      const nameLabel = listWidget.addText(name.toUpperCase());
      nameLabel.textColor = textColor;
      nameLabel.font = Font.semiboldSystemFont(15);
      nameLabel.minimumScaleFactor = 0.3;

      const temperatureStack = listWidget.addStack();
      temperatureStack.layoutHorizontally();

      const farenheit = (temperature * 9/5) + 32;
      const farenheitRounded = Math.round(farenheit * 10) / 10;

      const temperatureContent = temperatureStack.addText(`${farenheitRounded}º`);
      temperatureContent.textColor = textColor;
      temperatureContent.font = Font.semiboldSystemFont(20);

      temperatureStack.addSpacer(null);
      
      const humidityContent = temperatureStack.addText(`${humidity}%`);
      humidityContent.textColor = textColor;
      humidityContent.font = Font.semiboldSystemFont(20);

      listWidget.addSpacer(10);

    });
  } catch (error) {
    console.log(`Could not render widget: ${error}`);

    const errorWidgetText = listWidget.addText(`${error}`);
    errorWidgetText.textColor = Color.red();
    errorWidgetText.textOpacity = 30;
    errorWidgetText.font = Font.regularSystemFont(10);
  }

  if (config.runsInApp) {
    listWidget.presentSmall();
  }

  Script.setWidget(listWidget);
  Script.complete();
}

await run();
