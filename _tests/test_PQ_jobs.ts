import { Scheduler } from "../src";

test("Put one job onto pending jobs", () => {
  const scheduler = new Scheduler(1000);
  scheduler.schedule_in_milisec(1500, ()=> {});
  expect(scheduler.scheduled_job_cnt()).toBe(0);
  expect(scheduler._pending_queue.heap_size()).toBe(1);
});

test('Put two jobs onto pending at first and enqueue one job when possible', 
  async () => {
    const scheduler = new Scheduler(1000);
    scheduler.schedule_in_milisec(1500, () => {});
    scheduler.schedule_in_milisec(300000, () => {});
    expect(scheduler.scheduled_job_cnt()).toBe(0);
    expect(scheduler._pending_queue.heap_size()).toBe(2);
    
    /* Waits for one second before check the scheduler stats. */
    await new Promise((r) => setTimeout(r, 1000));
    expect(scheduler.scheduled_job_cnt()).toBe(1);
    expect(scheduler._pending_queue.heap_size()).toBe(1);
    
    await new Promise((r) => setTimeout(r, 500));
    expect(scheduler._jobs_done).toBe(1);
    expect(scheduler._pending_queue.heap_size()).toBe(1);
    scheduler._destroy();
});

test('Put two jobs onto pending at first and wait for both to be done', 
  async () => {
    const scheduler = new Scheduler(1000);
    scheduler.schedule_in_milisec(1500, () => {});
    scheduler.schedule_in_milisec(4000, () => {});
    expect(scheduler.scheduled_job_cnt()).toBe(0);
    expect(scheduler._pending_queue.heap_size()).toBe(2);
    
    /* Waits for one second before check the scheduler stats. */
    await new Promise((r) => setTimeout(r, 1000));
    expect(scheduler.scheduled_job_cnt()).toBe(1);
    expect(scheduler._pending_queue.heap_size()).toBe(1);
    
    await new Promise((r) => setTimeout(r, 500));
    expect(scheduler._jobs_done).toBe(1);
    expect(scheduler._pending_queue.heap_size()).toBe(1);
    
    await new Promise((r) => setTimeout(r, 1500));
    expect(scheduler.scheduled_job_cnt()).toBe(1);
    expect(scheduler._pending_queue.heap_size()).toBe(0);

    await new Promise((r) => setTimeout(r, 1000));
    expect(scheduler._jobs_done).toBe(2);
    expect(scheduler._pending_job_handle).toBe(undefined);
    scheduler._destroy();
});

test('Put ten jobs onto pending at first and wait for all to be done', 
  async () => {
    const scheduler = new Scheduler(1000);
    scheduler.schedule_in_milisec(1500, () => {});
    scheduler.schedule_in_milisec(1550, () => {});
    scheduler.schedule_in_milisec(1600, () => {});
    scheduler.schedule_in_milisec(1650, () => {});
    scheduler.schedule_in_milisec(1700, () => {});
    scheduler.schedule_in_milisec(1750, () => {});
    scheduler.schedule_in_milisec(1800, () => {});
    scheduler.schedule_in_milisec(1850, () => {});
    scheduler.schedule_in_milisec(1900, () => {});
    scheduler.schedule_in_milisec(2000, () => {});
    expect(scheduler.scheduled_job_cnt()).toBe(0);
    expect(scheduler._pending_queue.heap_size()).toBe(10);
    
    await new Promise((r) => setTimeout(r, 1000));
    expect(scheduler.scheduled_job_cnt()).toBe(10);
    expect(scheduler._pending_queue.heap_size()).toBe(0);
    
    await new Promise((r) => setTimeout(r, 1000));
    expect(scheduler._jobs_done).toBe(10);
});

test('Put five jobs onto pending at first and delete one', () => {
    const scheduler = new Scheduler(1000);
    scheduler.schedule_in_milisec(1500, () => {});
    scheduler.schedule_in_milisec(1550, () => {});
    scheduler.schedule_in_milisec(1600, () => {});
    scheduler.schedule_in_milisec(1650, () => {});
    scheduler.schedule_in_milisec(1700, () => {});

    expect(scheduler.scheduled_job_cnt()).toBe(0);
    expect(scheduler._pending_queue.heap_size()).toBe(5);
    
    /* The first job we put on pending queue should have an id of 1. */
    scheduler.cancel_job(1);
    expect(scheduler._pending_queue.heap_size()).toBe(4);
    expect(scheduler._pending_jobs_cancelled).toBe(1);
    scheduler._destroy();
  });
  
  test('Put five jobs onto pending at first, delete one and \
  wait for four to get done.', async () => {
    const scheduler = new Scheduler(1000);
    scheduler.schedule_in_milisec(1500, () => {});
    scheduler.schedule_in_milisec(1550, () => {});
    scheduler.schedule_in_milisec(1600, () => {});
    scheduler.schedule_in_milisec(1650, () => {});
    scheduler.schedule_in_milisec(1700, () => {});
    
    expect(scheduler.scheduled_job_cnt()).toBe(0);
    expect(scheduler._pending_queue.heap_size()).toBe(5);
    
    /* The first job we put on pending queue should have an id of 1. */
    scheduler.cancel_job(1);
    expect(scheduler._pending_queue.heap_size()).toBe(4);
    expect(scheduler._pending_jobs_cancelled).toBe(1);
    
    await new Promise((r) => setTimeout(r, 1000));
    expect(scheduler.scheduled_job_cnt()).toBe(4);
    expect(scheduler._pending_queue.heap_size()).toBe(0);

    await new Promise((r) => setTimeout(r, 1000));
    expect(scheduler._jobs_done).toBe(4);
});