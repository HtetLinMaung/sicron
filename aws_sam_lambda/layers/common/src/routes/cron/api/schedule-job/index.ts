import { brewBlankExpressFunc } from "code-alchemy";
import { jobs } from "../../../../variables";
import { v4 } from "uuid";
import connectMongoose from "../../../../utils/connect-mongoose";
import Job from "../../../../models/Job";
import scheduleApiJob from "../../../../utils/schedule-api-job";

export default brewBlankExpressFunc(async (req, res) => {
  const { jobid, repeatcount, rule, jobtype, options, access_key } = req.body;
  if (access_key != process.env.access_key) {
    return res.status(401).json({
      code: 401,
      message: "Unauthorized!",
    });
  }
  await connectMongoose();

  const jobId: string = jobid || v4();

  const job = new Job({
    jobid: jobId,
    jobtype,
    rule,
    options,
    repeatcount,
  });
  await job.save();

  if (jobtype == "api") {
    jobs[jobId] = scheduleApiJob(jobid, rule, options);
  }

  res.json({
    code: 200,
    message: `Job ID ${jobId} scheduled successful.`,
    data: {
      jobid: jobId,
    },
  });
});
