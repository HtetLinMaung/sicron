import httpClient from "starless-http";
import { v4 } from "uuid";
import Job from "./models/Job";
import connectMongoose from "./utils/connect-mongoose";
import scheduleApiJob from "./utils/schedule-api-job";
import { jobs } from "./variables";
import { log } from "starless-logger";

export const afterWorkerStart = async () => {
  log("Worker started...");
  await connectMongoose();
  if (process.env.init_jobs_mode == "api" && process.env.init_jobs_url) {
    log("fetching init data");
    const [response, err] = await httpClient.get(process.env.init_jobs_url);
    if (err || response.status >= 400) {
      if (response) {
        log(response.data);
      } else {
        log(err.message, "error");
      }
    } else {
      log(response.data.data);
      // await Job.deleteMany({
      //   jobid: {
      //     $in: response.data.data.map((d: any) => d.jobid),
      //   },
      // });
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
