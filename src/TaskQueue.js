/**
 * TaskQueue.js
 * ------------
 *
 * @flow
 */

//import Rx from '@reactivex/rxjs';

import Task from './Task';
import TaskError from './TaskError';

import type { Task$Executor, Task$options } from './Task';

export type TaskQueue$options = Task$options & {
    concurrency: number, // default: 1
};



class TaskQueue extends Task {

    tasks: Array<Task> = [];

    constructor(name?: string, tasks: object | Array<Task> | Task, options: TaskQueue$options) {
        super(name, async (action) => {
            return Promise.map(this.tasks, async (task:Task) => {
                // TODO: intercept task's updateAction() and prefix your name to it's logging!
                //updateAction(`>> ${this.name} >> ${task.name}`);
                return await task.run();
            }, { concurrency: this.concurrency })
        });
        if (tasks instanceof Task) {
            tasks = [ tasks ];
        }
        if (!Array.isArray(tasks)) {
            tasks = [];
        }
        this.tasks = tasks;
        //console.log('TaskQueue#constructor()', this, tasks, options);
    }

}

export default TaskQueue;
