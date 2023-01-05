import { Schema, model } from "mongoose";

export interface JobModel {
  _id: string;
  jobid: string;
  jobtype: string;
  rule: any;
  options: any;
  status: string;
  repeatcount: number;
  finishedcount: number;
}

const jobSchema = new Schema(
  {
    jobid: {
      type: String,
      required: true,
      unique: true,
    },
    jobtype: {
      type: String,
      default: "api",
    },
    rule: {
      type: Schema.Types.Mixed,
      default: {},
    },
    options: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["active", "cancel", "start", "finish", "fail"],
      default: "active",
    },
    repeatcount: {
      type: Number,
      default: 0,
    },
    finishedcount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default model("Job", jobSchema);
