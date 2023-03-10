import httpClient from "starless-http";
import { v4 } from "uuid";
import Job from "./models/Job";
import connectMongoose from "./utils/connect-mongoose";
import log from "./utils/log";
import scheduleApiJob from "./utils/schedule-api-job";
import { jobs } from "./variables";

export const afterWorkerStart = async () => {
  console.log("Worker started...");
  await connectMongoose();
  if (process.env.init_jobs_mode == "api" && process.env.init_jobs_url) {
    log("fetching init data");
    const [response, err] = await httpClient.get(process.env.init_jobs_url);
    if (err || response.status >= 400) {
      if (response) {
        console.log(response.data);
      } else {
        console.error(err.message);
      }
    } else {
      console.log(response.data.data);
      for (const {
        jobid,
        rule,
        options,
        jobtype,
        repeatcount,
        status,
        finishedcount,
      } of response.data.data) {
        const jobId: string = jobid || v4();
        let job = await Job.findOne({ jobid: jobId });
        if (!job) {
          job = new Job();
        }
        job.jobid = jobId;
        job.rule = rule;
        job.options = options;
        job.jobtype = jobtype;
        job.repeatcount = repeatcount;
        job.status = status;
        job.finishedcount = finishedcount || 0;
        await job.save();
        if (status == "active") {
          jobs[jobId] = scheduleApiJob(jobId, rule, options);
        }
      }
    }
  }
};
