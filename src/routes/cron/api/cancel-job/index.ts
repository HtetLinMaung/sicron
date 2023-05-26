import { brewBlankExpressFunc } from "code-alchemy";
import Job from "../../../../models/Job";
import connectMongoose from "../../../../utils/connect-mongoose";
import { jobs } from "../../../../variables";
import { log } from "console";

export default brewBlankExpressFunc(async (req, res) => {
  const { access_key, jobid } = req.body;
  if (access_key != process.env.access_key) {
    return res.status(401).json({
      code: 401,
      message: "Unauthorized!",
    });
  }
  await connectMongoose();
  const job = await Job.findOne({
    jobid,
    status: "active",
  });
  if (!jobs[jobid] || !job) {
    log(`Job ID ${jobid} not found!`);
    return res.status(404).json({
      code: 404,
      message: `Job ID ${jobid} not found!`,
    });
  }
  jobs[jobid].cancel();
  job.status = "cancel";
  await job.save();
  log(`Job ID ${jobid} canceled successful.`);
  res.json({
    code: 200,
    message: `Job ID ${jobid} canceled successful.`,
  });
});
