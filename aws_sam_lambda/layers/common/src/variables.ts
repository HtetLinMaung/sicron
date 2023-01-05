import { Job } from "node-schedule";

interface Jobs {
  [key: string]: Job;
}

export const jobs: Jobs = {};
// https://scm.mitcloud.com/mit_ibanking/si-cron.git
