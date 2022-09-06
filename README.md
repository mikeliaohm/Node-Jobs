# Node-Jobs

## A Typescript library to schedule tasks (i.e. functions) to be run at future time.

### Implementation Steps

- Infrastructure of the scheduler, including bookkeeping of scheduled jobs.
- Priority Queue implementation.
- Scheduling of the pending jobs. 

### Project Layout

```
- _tests
  - test_Job.ts
  - test_PQ_jobs.ts
  - test_PQ.ts
  - test_Scheduler.ts
- src
  - Job.ts
  - PendingJob.ts
  - PriorityQueue.ts
  - Scheduler.ts
```
