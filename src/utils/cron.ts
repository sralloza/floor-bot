import settings from "../config";

export const areTasksCronEnabled = () => {
  if (settings.disable_scheduler_start_date == null) return true;
  if (settings.disable_scheduler_end_date == null) return true;

  const today = Date.now()
  const part_1 = settings.disable_scheduler_start_date <= today;
  const part_2 = today <= settings.disable_scheduler_end_date;
  return !(part_1 && part_2);
};
