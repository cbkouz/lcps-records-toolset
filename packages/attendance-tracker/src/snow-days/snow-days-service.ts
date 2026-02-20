import { snowDaysRepository } from "./snow-days-repo";

export class SnowDaysService {
  constructor(private repo: snowDaysRepository) { }

  public filterSnowDays(attendanceLogs: any[][], snowDayQueue.dates: Set<string>): any[][] {
    