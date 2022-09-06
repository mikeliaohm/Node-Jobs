import { Job } from "../src";

test('Simple job', () => {
  const job = new Job(1, 1, () => { console.log("test function"); });
  expect(job.id).toBe(1);
  expect(job._milisec).toBe(1);
});