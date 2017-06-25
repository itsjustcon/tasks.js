/**
 * Task.js
 * -------
 *
 * @flow
 */

import Promise from 'bluebird'
import isPromise from '@itsjustcon/utils/isPromise'
//import once from '@itsjustcon/utils/once'
import once from 'lodash/once'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { $$rxSubscriber } from 'rxjs/symbol/rxSubscriber'

import TaskError from './TaskError'

export type Task$ActionUpdater = (action: string) => void
export type Task$Executor = (updateAction: Task$ActionUpdater) => Promise

export type Task$options = {
    log: boolean, // default: false
}



class Task {

    name: string = null;

    isRunning: boolean = false;

    constructor(name?: string, executor: Task$Executor, options: Task$options) {

        if (typeof name === 'function') {
            [ name, executor ] = [ executor, name ];
        }
        if (typeof name !== 'string') {
            name = null;
        }

        this.name = name || executor.name || null;

        Object.defineProperty(this, 'executor', { value: executor });

        let subject;
        Object.defineProperty(this, '_subject', {
            configurable: true,
            get() {
                if (!subject || subject.isStopped) {
                    subject = new Subject();
                }
                return subject;
            },
        });

    }

    run() : this {
        if (!this.isRunning) {
            this.isRunning = true;
            const subject = this._subject; // so we don't accidentally trigger the next subject
            const errorFn = once((err) => { this.isRunning = false; subject.error(err); });
            const completeFn = once(() => { this.isRunning = false; subject.complete(); });
            const updateAction:Task$ActionUpdater = (val) => { subject.next(val); }
            if (this.name) {
                console.log(`>> ${this.name}`);
            }
            let promise;
            try {
                promise = this.executor(updateAction);
            } catch (err) {
                errorFn(err);
                return this;
            }
            if (isPromise(promise)) {
                promise.then(completeFn, errorFn);
                // TODO: append to the TaskTrace before calling errorFn()
            } else completeFn();
        }
        return this;
    }

    /**
     * Promise Support
     */
    asPromise() : Promise {
        return new Promise((resolve, reject) =>
            this._subject.subscribe({ complete: resolve, error: reject })
        );
    }
    then(onFulfilled?: (value: any) => any, onRejected?: (error: Error) => any) : Promise {
        if (!this.isRunning) {
            this.run();
        }
        return this.asPromise().then(...arguments);
    }
    catch(onRejected?: (error: Error) => any) : Promise {
        return this.asPromise().catch(...arguments);
    }

    /**
     * Observable Support
     */
    asObservable() : Observable {
        return new Observable((observer) => this.subscribe(observer));
    }
    subscribe(observerOrNext: Function | Rx$Observer, error?: Function, complete?: Function) : this {
        this._subject.subscribe(...arguments);//Observable.from(this).subscribe(...arguments);
        return this;
    }
    dispose() : this {
        throw new Error('Task#dispose() is not implemented!');
        //this.stop();
        return this;
    }
    [Symbol.observable]() {
        //return this._subject;
        return this.asObservable();
    }
    [Symbol.rxSubscriber || $$rxSubscriber]() {
        return this._subject;
    }

}

export default Task;
