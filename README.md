# node-tasks
A declarative, test-driven framework for organizing what you're doing - written
in Node.js

***DANGER:*** This README is very incomplete & some of the features outlined
here are not yet working. *Follow at your own risk!*

## Getting Started
> TDD in your production code

`node-tasks` is a simple package that pushes a declarative coding style that is
very similar to TDD.

There are two main concepts:

**Task** - an encapsulated, asynchronous function that achieves an end goal
*(examples: `'Create User'`, `'Process Order'`, `'Deploy Code'`)*

**Action** - an optional method available inside a `Task` that allows you to
annotate the "steps" of a task. Utilizing this method will make your code more
readable and makes your [errors](#error-handling) much easier to hunt-down *(more on this [later](#tracing))*

## Methods

### `task(name, function)`
```js
import { task } from 'node-tasks'

task('Create User', async (action) => {
  action('validate user')
  // ...
  action('save user to db')
  // ...
  action('send welcome email')
  // ...
})
```

### `tasks(name, functions)`
```js
import { task, tasks } from 'node-tasks'

await tasks([
  task('', async (action) => {
    action('...')
    // ...
    action('...')
    // ...
  }),
  task('', async (action) => {
    action('...')
    // ...
    action('...')
    // ...
  }),
  task('', async (action) => {
    action('...')
    // ...
    action('...')
    // ...
  }),
]/*, { concurrency: Infinity }*/)
```

## Logging

```js
await tasks([
  task('Task #1', async (action) => {}),
  task('Task #2', async (action) => {}),
  task('Task #3', async (action) => {})
], { log: true })
// OUTPUT:
// >> Task #1
// >> Task #2
// >> Task #3
```

## Composition
The ability to nest `task()` with `tasks()` opens up some cool concurrency declarations that are both powerful *and* easy to read:
```js
await tasks([
  task('Task #1', async () => {}),
  task('Task #2', async () => {}),
  tasks('Group #1', [
    task('Group #1 - Task #1', async () => {}),
    task('Group #1 - Task #2', async () => {}),
  ], { concurrency: Infinity }),
  task('Task #3', async () => {}),
], { log: true })
// OUTPUT:
// >> Task #1
// >> Task #2
// >> Group #1 >> Task #1
// >> Group #1 >> Task #2
// >> Task #2
```
The root-level gets run in-order *(default: `{ concurrency: 1 }`)*

## Error Handling
Once you get into the habit of [composition](#Composition) then async tracing/error handling comes for-free!
```js
await tasks([
  task('Task #1', async () => {}),
  task('Task #2', async () => {}),
  task('Task #3', async () => {})
])
// throws:
// TaskError:
//
//
//
//
//
```

## Tracing
The hierarchy of `task()` vs `action()` is really great debugging/tracing tool if used properly.

## Classes
The utility functions above are the main ways you'll be working with this package.
However, if you want to extend functionality, create your own subclasses, or are
just plain interested in how things work, here's a lower-level view of our core:

### `Task`
The class behind `task(...)` which is actually just a shortcut for `new Task(...)`!
```js
import { Task } from 'node-tasks'

new Task('', async () => {
  // ...
})
```

### `TaskQueue`
The class behind `tasks(...)` which is actually just a shortcut for `new TaskQueue(...)`!
```js
import { TaskQueue } from 'node-tasks'

new TaskQueue('', async () => {
  // ...
})
```

### `TaskError`
A sub-class of `Error` (native) that uses [`TaskTrace`](#TaskTrace) instead of `StackTrace` for error-tracing & call-stacks.
```js
import { TaskError } from 'node-tasks'
```

### `TaskTrace`
This is secretly one of the most useful classes - but you'll likely never need to use it yourself. It is essentially a Stack Trace composed of `Task` and `TaskQueue` objects instead of `StackFrame` objects!
```js
import { TaskTrace } from 'node-tasks'
```
