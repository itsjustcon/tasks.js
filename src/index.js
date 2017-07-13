/**
 * index.js
 * --------
 *
 * @flow
 */

import Task from './Task';
import TaskQueue from './TaskQueue';

import type { Task$Executor, Task$options } from './Task';
import type { TaskQueue$options } from './TaskQueue';

function task(name?: string, executor: Task$Executor, options?: Task$options) : Task {
    return new Task(name, executor, options);
}
function tasks(name?: string, tasks: Array<Task>, options?: TaskQueue$options) : TaskQueue {
    return new TaskQueue(name, tasks, options);
}

export default task;
export {
    task,
    tasks,
    Task,
    TaskQueue,
};
