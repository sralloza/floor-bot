import schedule from "node-schedule";

export default () => {
  schedule.scheduleJob("*/15 * * * *", function () {
    console.log("Health check");
  });
};
