/**
 * PendingJob.ts
 * -------------
 * by Mike Liao
 * 
 * Defines a task to execute for some specific delay in time which exceeds
 * the maximum allowed delay in Node's timer module.
 */

import { Comparable } from "./PriorityQueue";

/* A pending job encapsulates the task that cannot be put onto Node's
   timer queue since it exceeds the maximum allowed delay. */
class PendingJob implements Comparable {
  id: number;             /* Unique id number for the job. */
  timestamp: number;      /* The time to actually execute TASK. */
  task: () => void;       /* Task to execute. */

  constructor(id: number, timestamp: number, fn: () => void) {
    this.id = id;
    this.timestamp = timestamp;
    this.task = fn;
  }

  key(): number {
    return this.timestamp;
  }

  set_key(new_key: number): void {
    this.timestamp = new_key;
  }

  less(that: Comparable): boolean {
    return this.key() < that.key();
  }
}

export default PendingJob;