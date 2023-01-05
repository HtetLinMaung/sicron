import { Schema, model } from "mongoose";
import { JobModel } from "./Job";

export interface JobHistoryModel {
  _id: string;
  job: string | JobModel;
  log: any;
}

const jobHistorySchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    log: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default model("JobHistory", jobHistorySchema);
