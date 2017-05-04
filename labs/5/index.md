---
layout: page
title: "Lab 5: Concurrency &amp; Parallelism"
---

## Lab 5: Concurrency &amp; Parallelism

In today's lab we will be talking about concurrency and parallelism, and
how Rust's features enable safe concurrency and parallelism in your code.

(Note: This lesson is largely an adaptation of the chapter on concurrency and parallelism from the new edition of The Rust Programming Language by Steve Klabnik and Carol Nichols)

### Terminology

First, let's review some terminology

1. Concurrency: Having multiple threads of control.
2. Parallelism: Running at the same time.
3. Deadlock: When all threads of control are stopped, and unable to progress.
4. Livelock: When all threads of control are running, but are unable to progress.
5. Starvation: When a thread is unable to access machine resources, and thus can't progress.
6. Data race: A flaw that occurs when two threads both make non-read, non-synchronizing operations against the same memory location concurrently.
7. Race condition: A flaw that occurs when timing or ordering or events affects program correctness.

### Processes and Threads

Your computer runs multiple programs at the same time by spawning a _process_ for each program, each of which runs concurrently. In addition, each process may spawn _threads_, which allow for concurrency within a single process.

You spawn a thread in Rust like so:

```rust
use std::thread;

fn main() {
    thread::spawn(|| {
        for i in 1..10 {
            println!("#{} from the spawned thread!", i);
        }
    });

    for i in 1..5 {
        println!("#{} from the main thread!", i);
    }
}
```

If you run this, you'll notice that the spawned thread (also called the child thread) may not print all the numbers up to 10. This is because the process ends when the original thread (also called the parent thread) finishes. So if the parent thread doesn't wait for the child thread, the child thread doesn't get to finish what it was doing. We can wait like so:

```rust
use std::thread;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("#{} from the spawned thread!", i);
        }
    });

    for i in 1..5 {
        println!("#{} from the main thread!", i);
    }

    // This makes sure the parent thread waits for the child.
    handle.join();
}
```

Notice that the waiting happens wherever we put the `join()` call. If we move it before the `for` loop, the loop won't run until after the child thread has finished its work:

```rust
use std::thread;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("#{} from the spawned thread!", i);
        }
    });

    handle.join();

    for i in 1..5 {
        println!("#{} from the main thread!", i);
    }
}
```

### Ownership and Threads

You may be wondering how threads interact with Rust's ownership rules. Let's look at an example:

```rust
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(|| {
        println!("Here's a vector: {:?}", v);
    });

    handle.join();
}
```

In this example, we have a vector defined in the parent thread, but used in the child thread. Rust sees that the child thread only needs to borrow the vector (a borrow is what's required by `println!`, and so it applies the standard safety rules to see if the borrow is safe. Unfortunately, it sees that the child thread may outlive the vector. The compiler doesn't know how long the child thread will run, so as far as it knows, that borrow may end up referencing invalid memory at some point down the line.

The solution is to tell the compiler to move the vector into the child thread, like so:

```rust
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(move || {
        println!("Here's a vector: {:?}", v);
    });

    handle.join();
}
```

### Message Passing

There are two ways for threads to communicate. The first is message passing. With message passing, the threads don't share any data, but they have the ability to pass data back and forth. This is accomplished via _channels_:

```rust
use std::thread;
use std::sync::mpsc;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("hi");
        tx.send(val).unwrap();
    });

    let received = rx.recv().unwrap();
    println!("Got: {}", received);
}
```

In this example, we spawn a new channel, getting back `tx` (the sender) and `rx` (the receiver). `tx` is used in the child thread to send messages to the parent thread. This `send` function takes ownership of its parameter, which is key to ensuring safety. If we try to pass something along on the channel in the child thread, and then use it again in the child thread, we get a compilation error! If a type implements the `Copy` trait, it just gets copied, and we're fine!

To make the sending more obvious, let's send multiple values and add a delay:

```rust
use std::thread;
use std::sync::mpsc;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::new(1, 0));
        }
    });

    for received in rx {
        println!("Got: {}", received);
    }
}
```

You can also clone the sender as many times as you want, allowing a bunch of children to send messages back to the parent thread.

### Shared Memory

The other way for threads to share data is to literally share the data. To do this, you need something to help make sure the sharing is safe! Enter `Mutex`.

`Mutex` is a type that provides _mutual-exclusion_, meaning it makes sure that only one thread is looking at the data at one time. If a thread tries to look at the data but the other is already looking, that thread has to wait for the first one to be finished. This ensures that data races are avoided.

Here's an example:

```rust
use std::sync::Mutex;
use std::thread;

fn main() {
    let counter = Mutex::new(0);
    let mut handles = vec![];

    for _ in 0..10 {
        let handle = thread::spawn(|| {
            let mut num = counter.lock().unwrap();

            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}
```

This program spawns 10 threads and has them each increment the same number. The parent thread waits on all the children and then prints the result. The key is the `lock()` function, which ensures that only one thread is accessing the `counter` at a single time!

Of course, this code actually doesn't work! It doesn't work because `counter` can't have its ownership passed to all 10 threads at once. We solve this with `Arc`.

`Arc` is an "atomic" reference-counted type. It's thread-safe, which means it can be sent between threads (unlike `Rc`, which is also a reference-count type, but not a thread safe one). If we wrap the `counter` in an `Arc`, our code works:

```rust
use std::sync::{Mutex, Arc};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = counter.clone();
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();

            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}
```

### `Send` and `Sync`

All of the mechanisms we covered above are based on two key traits: `Send` and `Sync`.

`Send` is for types that can be safely sent between threads.

`Sync` is for types that can be safely shared between threads.

Rust infers both traits automatically in almost all cases, so you don't need to worry about implementing them manually.

Rust's reference count type, `Rc`, does _not_ implement `Send`, but `Arc`, the atomic reference count type, does!

`Mutex` implements `Sync`, which is how you're able to use it to solve the data race problem.

Together, these two primitives provide for safe concurrency in Rust!

### Conclusion

So, in conclusion, Rust's ownership system, combined with the `Send` and `Sync` traits, provides a strong mechanism for ensuring safe and easy concurrency!

__For this lab, solve the linked-to [Dining Philosophers problem](https://is.gd/59gz7Q) by getting the program to compile and run successfully. "Successfully" here means "all the philosophers finish eating." Submit your answer in a single .rs file, emailed to me by 4:00pm next Thursday.__
