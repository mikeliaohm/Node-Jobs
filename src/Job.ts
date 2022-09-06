/**
 * Job.ts
 * ------
 * by Mike Liao
 * 
 * Defines a basic unit of task to execute for some specific delay in time.
 */

/* A job encapsulates the task to execute in specified time delay. */
class Job {
  id: number;                 /* Unique id number for the job. */
  _milisec: number;           /* Execution delay in miliseconds. */
  _task: () => void;          /* Task to execute. */
  ref: NodeJS.Timeout | null  /* Reference to the timeout obj. */

  /**
   * @param milisec Execution delay in miliseconds.
   * @param fn Task (the function) to execute after the delay.
   */
  constructor(id: number, milisec: number, fn: () => void) {
    this.id = id;
    this._milisec = milisec;
    this._task = fn;
    this.ref = null;
  }

  /* Executes _TASK. */
  exc() { 
    this._task();
    console.log(`finished executing job ${this.id}.`);
  }
}

export default Job;