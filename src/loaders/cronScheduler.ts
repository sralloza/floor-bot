import schedule from "node-schedule";

export default () => {
  schedule.scheduleJob("* * * * *", function () {
    console.log("Today is a new day!");
  });
};
