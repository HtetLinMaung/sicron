import moment from "moment";

export default function log(msg: string) {
  console.log(`${moment().format("MMMM Do YYYY, h:mm:ss a")} ${msg}`);
}
