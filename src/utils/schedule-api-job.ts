import { scheduleJob } from "node-schedule";
import httpClient from "starless-http";
import Job from "../models/Job";
import JobHistory from "../models/JobHistory";
import { jobs } from "../variables";
import connectMongoose from "./connect-mongoose";
import log from "./log";

export default function scheduleApiJob(jobid: string, rule: any, options: any) {
  return scheduleJob(
    typeof rule == "string" ? new Date(rule) : rule,
    async () => {
      log("Job started");
      await connectMongoose();
      let job = await Job.findOne({ jobid, status: "active" });
      if (!job) {
        return false;
      }
      if (job.repeatcount && job.repeatcount >= job.finishedcount) {
        if (jobs[jobid]) {
          jobs[jobid].cancel();
        }
        return false;
      }
      job.status = "start";
      await job.save();
      const jobHistory = new JobHistory({
        job: job._id,
      });
      try {
        const { url } = options;
        const body = options.body || {};
        const headers = options.headers || {};
        const params = options.query || {};
        const method = options.method ? options.method.toLowerCase() : "get";

        let response = null;
        let err = null;
        if (method == "get") {
          [response, err] = await httpClient.get(url, {
            params,
            headers,
          });
        } else if (method == "post") {
          [response, err] = await httpClient.post(url, body, {
            params,
            headers,
          });
        } else if (method == "put") {
          [response, err] = await httpClient.put(url, body, {
            params,
            headers,
          });
        } else if (method == "patch") {
          [response, err] = await httpClient.patch(url, body, {
            params,
            headers,
          });
        } else if (method == "delete") {
          [response, err] = await httpClient.delete(url, {
            params,
            headers,
          });
        }

        if (err || response.status >= 400) {
          job.status = "fail";
          await job.save();
          jobHistory.log = {};
          if (response) {
            jobHistory.log = {
              status: response.status,
              responseData: response.data,
              errMessage: null,
            };
          } else {
            jobHistory.log = {
              status: null,
              responseData: null,
              errMessage: err.message,
            };
          }
        } else {
          jobHistory.log = {
            status: response.status,
            responseData: response.data,
            errMessage: null,
          };
          job.status = "finish";
          await job.save();
          await Job.findOneAndUpdate(
            { _id: job._id },
            {
              $inc: {
                finishedcount: 1,
              },
            }
          );
        }
        await jobHistory.save();
      } catch (err) {
        job.status = "fail";
        jobHistory.log = {
          status: null,
          responseData: null,
          errMessage: err.message,
        };
        await job.save();
        await jobHistory.save();
      }
    }
  );
}
