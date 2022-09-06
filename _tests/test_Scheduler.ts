import { Scheduler } from "../src";

/* Test 1. */
test('Schedule in mins. All jobs are not to be excuted', () => {
  const scheduler = new Scheduler();
  scheduler.schedule_in_mins(1, () => { console.log("exe job in 1 min"); });
  scheduler.schedule_in_mins(2, () => { console.log("exe job in 2 mins"); });
  scheduler.schedule_in_mins(3, () => { console.log("exe job in 2 mins"); });

  expect(scheduler.scheduled_job_cnt()).toBe(3);
  expect(scheduler._jobs_done).toBe(0);
  scheduler._destroy();
  expect(scheduler.scheduled_job_cnt()).toBe(0);
});

/* Test 2. */
test('Schedule in secs. All jobs are not to be executed', () => {
  const scheduler = new Scheduler();
  scheduler.schedule_in_secs(10, () => { console.log("exe job in 10 secs"); });
  scheduler.schedule_in_secs(20, () => { console.log("exe job in 20 secs"); });
  scheduler.schedule_in_secs(30, () => { console.log("exe job in 30 secs"); });
  
  expect(scheduler.scheduled_job_cnt()).toBe(3);
  expect(scheduler._jobs_done).toBe(0);
  scheduler._destroy();
  expect(scheduler.scheduled_job_cnt()).toBe(0);
});

/* Test 3. */
test('Schedule in dates. All jobs are not to be executed.', () => {
  const today = new Date();
  let yesterday = new Date();
  let tomorrow = new Date();
  let day_after_tmr = new Date();
  yesterday.setDate(today.getDate() - 1);
  tomorrow.setDate(today.getDate() + 1);
  day_after_tmr.setDate(today.getDate() + 2);
  const scheduler = new Scheduler();

  /* Yesterday's job should not be scheduled. */
  scheduler.schedule_at_date(yesterday, 
                            () => { console.log("exe job yesterday"); });
  expect(scheduler.scheduled_job_cnt()).toBe(0);

  /* Future jobs should be scheduled. */
  scheduler.schedule_at_date(tomorrow, 
                             () => { console.log("exe job tomorrow"); });
  scheduler.schedule_at_date(day_after_tmr, 
                             () => { 
                                console.log("exe job the day after tomorrow");
                              });
  
  expect(scheduler.scheduled_job_cnt()).toBe(2);
  expect(scheduler._jobs_done).toBe(0);
  scheduler._destroy();
  expect(scheduler.scheduled_job_cnt()).toBe(0);
});

/* Test 4. */
test('Schedule in milisecs, All jobs are expected to be executed', async () => {
  const scheduler = new Scheduler();
  scheduler.schedule_in_milisec(1, () => { console.log("exe job in 1 milisec"); });
  scheduler.schedule_in_milisec(2, () => { console.log("exe job in 2 milisecs"); });
  scheduler.schedule_in_milisec(3, () => { console.log("exe job in 3 milisecs"); });
  
  /* Waits for one second before check the scheduler stats. */
  await new Promise((r) => setTimeout(r, 1000));
  expect(scheduler.scheduled_job_cnt()).toBe(0);
  expect(scheduler._jobs_done).toBe(3);
  scheduler._destroy();
  expect(scheduler.scheduled_job_cnt()).toBe(0);
});

/* Test 5. */
test('Schedule jobs. One cancelled and two executed.', async () => {
  const scheduler = new Scheduler();
  scheduler.schedule_in_secs(1, () => { console.log("exe job in 1 sec"); });
  scheduler.schedule_in_secs(2, () => { console.log("exe job in 2 secs"); });
  const job_id = scheduler.schedule_in_mins(1, 
                                            () => { 
                                              console.log("exe job in 1 min"); 
                                            });
  expect(scheduler.scheduled_job_cnt()).toBe(3);
  expect(scheduler._jobs_done).toBe(0);
  
  /* Waits for two second before check the scheduler stats. */
  await new Promise((r) => setTimeout(r, 2000));
  expect(scheduler.scheduled_job_cnt()).toBe(1);
  expect(scheduler._jobs_done).toBe(2);
  
  /* Cancels one job and checks the scheduler stats. */
  scheduler.cancel_job(job_id);
  expect(scheduler.scheduled_job_cnt()).toBe(0);
  expect(scheduler._jobs_done).toBe(2);
  expect(scheduler._jobs_cancelled).toBe(1);
});