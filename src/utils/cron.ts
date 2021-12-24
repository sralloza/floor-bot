import settings from "../config";

export const areTasksCronEnabled = () => {
  if (settings.disableSchedulerStartDate == null) return true;
  if (settings.disableSchedulerEndDate == null) return true;

  const today = Date.now()
  const part_1 = settings.disableSchedulerStartDate <= today;
  const part_2 = today <= settings.disableSchedulerEndDate;
  return !(part_1 && part_2);
};
