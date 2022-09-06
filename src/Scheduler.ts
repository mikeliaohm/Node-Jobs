/**
 * Scheduler.ts
 * ------------
 * by Mike Liao
 * 
 * Defines a job scheduler that keeps track all of the jobs' lifecycles. 
 * The scheduler is responsible to place the jobs onto the Event Loop in the
 * Node environment. If a job's desired delay exceeds the maximum allowed, 
 * the scheduler will push the specific job onto its queue and place it in
 * the Event Loop at an appropriate time. 
 */

import { Job, PendingJob, PriorityQueue } from "./index"

const MAX_DELAY_IN_MILISEC = Math.pow(2, 31) - 1;
const MILISECS_PER_SEC = 1000;
const ERROR_JOB_ID = 0;
const DEBUG = 'debug';

class Scheduler {
  _id_seed = 1;                         /* The unique id for each job. */
  _jobs_done = 0;                       /* Keep track number of jobs done. */
  _jobs_cancelled = 0;                  /* Keep track number of jobs cancelled. */
  _pending_jobs_cancelled = 0;          /* Keep track number of pending jobs 
                                           cancelled. */
  _pending_queue: PriorityQueue         /* Jobs not yet scheduled. */
  _scheduled_jobs: Map<number, Job>     /* All jobs scheduled but 
                                           not yet executed. */
  _pending_jobs: Map<number, PendingJob>/* All jobs in pending. */
  _max_delay: number                    /* The maximum allowed delay to enqueu
                                           in Node's timer module. Any job
                                           exceeding this limit will be placed
                                           in _PENDING_QUEUE first. */
  _pending_job_handle?: NodeJS.Timeout

  constructor(max_delay?: number) {
    this._scheduled_jobs = new Map();
    this._pending_queue = new PriorityQueue();
    this._pending_jobs = new Map();

    if (max_delay != null && max_delay != undefined)
      this._max_delay = max_delay;
    else
      this._max_delay = MAX_DELAY_IN_MILISEC;
  }

  /**
   * @returns The number of scheduled jobs not yet executed. 
   */
  scheduled_job_cnt(): number {
    return this._scheduled_jobs.size;
  }

  /**
   * The function wraps the task (i.e. the function) to execute in the 
   * Node's timer scheduler. In addtion to execute the task, the function
   * will also book keep some stats internal to the scheduler. 
   * 
   * @param job The job to execute. 
   */
  exc_scheduled_job(job: Job) {
    job.exc();
    job.ref = null;
    this._scheduled_jobs.delete(job.id);
    this._jobs_done++;

    if (process.env.NODE_ENV === DEBUG) {
      console.log(`-- [exc] job ${job.id}.`);
      this.dump();
    }
  }
  
  /**
   * The function will call clearTimeout() in Node's timer module and 
   * removes the task from its queue. The function will also book keep
   * some stats internal to the scheduler. 
   * 
   * @param job_id The job id to cancel in Node's timer scheduler.
   */
  cancel_job(job_id: number) {
    const job = this._scheduled_jobs.get(job_id);
    
    /* Only cancels a job if the job exists and still not executed. */
    if (job !== undefined && job.ref !== null) {
      this._scheduled_jobs.delete(job.id);
      clearTimeout(job.ref);
      job.ref = null;
      this._jobs_cancelled++;

      if (process.env.NODE_ENV === DEBUG) {
        console.log(`-- [cancel] job ${job.id}.`);
        this.dump();
      }
      return;
    }

    /* Searches for jobs in pending if job with JOB_ID is still in the
       _PENDING_QUEUE. */
    const pending_job = this._pending_jobs.get(job_id);
    if (pending_job != undefined) {
      this._pending_queue.decrease_key(pending_job, 0);
      this._pending_queue.extract_min();
      this._pending_jobs.delete(pending_job.id);
      this._pending_jobs_cancelled++;
    }
  }

  /**
   * Puts JOB onto Node's timer queue by calling setTimeout().
   * 
   * @param job Job to be put onto Node's timer queue.
   * @param delay In miliseconds.
   */
  enqueu_job(job: Job, delay: number) {
    const timeout_obj = setTimeout(() => 
                                     { this.exc_scheduled_job(job) }, 
                                     delay);
    this._scheduled_jobs.set(job.id, job);
    /* Stores the ref to the timeout object. */
    job.ref = timeout_obj;
  }

  /**
   * The function tries to schedule one or several pending jobs in the
   * _PENDING_QUEUE. It is possible that no pending job can be
   * enqueued since even the earliest one still exceeds the maximum allowed
   * delay. In such case, the task will be schedule again. 
   * 
   * @param delay_ofs The delay in miliseconds to try to schedule a 
   *                  pending job. 
   * @returns A handle to the pending job scheduling reference. This is 
   *          necessary since only one such scheduling should be performed
   *          at one time. The caller can keep the handle and call
   *          clearTimeout() at appropriate time. 
   */
  try_schedule_pending_job(delay_ofs: number): NodeJS.Timeout {
    return setTimeout(() => {
      const cur_timestamp = new Date().getTime();
      let earliest_job = this._pending_queue.min_node() as PendingJob;
      let delay_after_ofs = earliest_job.timestamp - cur_timestamp;

      /* Tries to enqueue all pending jobs that have elapsed enough
         time such that their delays in time can fit inside the 
         maximum allowed delay. */
      while (delay_after_ofs <= this._max_delay) {
        this._pending_queue.extract_min();
        this._pending_jobs.delete(earliest_job.id);
        const job = new Job(earliest_job.id, delay_after_ofs, 
                            earliest_job.task);
        this.enqueu_job(job, delay_after_ofs);
        
        if (this._pending_queue.heap_size() < 1)
          break;

        earliest_job= this._pending_queue.min_node() as PendingJob;
        delay_after_ofs = earliest_job.timestamp - cur_timestamp;
      }

      /* Schedules the next try_schedule_pending_job. */
      if (this._pending_queue.heap_size() > 0) {
        /* Uses lastly computed delay before the while loop exits. 
           The value should still correspond to the earliest job
           in the heap whether or not any popping off has taken place. */
        const next_delay = delay_after_ofs;
        const next_delay_ofs = Math.min(next_delay - this._max_delay, 
                                        this._max_delay);
        clearTimeout(this._pending_job_handle);
        this._pending_job_handle = this.try_schedule_pending_job(next_delay_ofs);
      } else {
        this._pending_job_handle = undefined;
      }
    }, delay_ofs);
  }

  /**
   * The function will call setTimeout() in Node's timer module to
   * schedule the task to execute in the future. When the delay exceeds
   * MAX_DELAY_IN_MILISEC, the scheduler will instead keep the job
   * in _TO_SCHEDULE queue so that it only adds the job until the job
   * can be put onto Node's timer scheduler. 
   * 
   * @param delay Delay in miliseconds to execute the task.
   * @param fn The function to execute. 
   * @returns The unique job id. 
   */
  schedule_in_milisec(delay: number, fn: () => void): number {
    /* Only enqueues the jobs when the delay is withing the
       max delay allowed. Otherwise, put the jobs onto 
       _PENDING_QUEUE. */
    if (delay > this._max_delay) {
      const cur_timestamp = new Date().getTime();
      const pending_job = new PendingJob(this._id_seed, 
                                         cur_timestamp + delay, fn);
      this._id_seed++;
      this._pending_queue.insert(pending_job);
      this._pending_jobs.set(pending_job.id, pending_job);
      const delay_ofs = Math.min(delay - this._max_delay, this._max_delay);
      clearTimeout(this._pending_job_handle);
      this._pending_job_handle = this.try_schedule_pending_job(delay_ofs);
      
      return pending_job.id;
    }

    const job = new Job(this._id_seed, delay, fn);
    this._id_seed++;
    this.enqueu_job(job, delay);
    return job.id;
  }

  /**
   * The functions calls SCHEDULE_IN_MILISEC() after compute the
   * delay in miliseconds.
   * 
   * @param delay_in_secs Delay in seconds to execute the task.
   * @param fn The function to execute.
   * @returns The unique job id.
   */
  schedule_in_secs(delay_in_secs: number, fn: () => void): number {
    const delay = delay_in_secs * MILISECS_PER_SEC;
    return this.schedule_in_milisec(delay, fn);
  }

  /**
   * The functions calls SCHEDULE_IN_MILISEC() after compute the
   * delay in miliseconds.
   * 
   * @param delay_in_mins Delay in minutes to execute the task.
   * @param fn The function to execute.
   * @returns The unique job id.
   */
  schedule_in_mins(delay_in_mins: number, fn: () => void): number {
    return this.schedule_in_secs(delay_in_mins * 60, fn);
  }

  /**
   * The functions calls SCHEDULE_IN_MILISEC() after compute the
   * delay in miliseconds as compared to the current time returned
   * by making a call to Date.now().
   * 
   * @param date A future datetime to execute the task.
   * @param fn The function to execute.
   * @returns The unique job id.
   */
  schedule_at_date(date: Date, fn: () => void): number {
    const desired_timestamp = date.getTime();
    const cur_timestamp = Date.now();

    if (process.env.NODE_ENV === DEBUG) {
      console.log(`schedule: ${date} / ${desired_timestamp}, 
                  cur date: ${new Date(cur_timestamp)} / ${cur_timestamp}`);
      console.log(`diff in timestamp is ${desired_timestamp - cur_timestamp}`);
    }

    /* This is an no-op when trying to schedule job at an earlier time. */
    if (desired_timestamp < cur_timestamp)
      return ERROR_JOB_ID;

    return this.schedule_in_milisec(desired_timestamp - cur_timestamp, fn);
  }

  /**
   * Output in console the selected stats internal to the scheduler. 
   * The function should normally only called in DEBUG mode to use
   * such stats for testing and debugging.
   */
  dump() {
    console.log("\n=======");
    console.log(`Number of jobs scheduled: ${this.scheduled_job_cnt()}`);
    console.log(`Number of jobs done: ${this._jobs_done}`);
    console.log(`Number of jobs cancelled: ${this._jobs_cancelled}`);
    console.log("=======\n");
  }

  /**
   * Facilates destroying all unexecuted jobs still in Node's timer
   * scheduler. This function helps supress the warning when running
   * testing when some futures jobs are never expected to carry out
   * in testings. 
   */
  _destroy() {
    for(let key of Array.from(this._scheduled_jobs.keys())) {
      this.cancel_job(key);
    }
    clearTimeout(this._pending_job_handle);
  }
}

export default Scheduler;