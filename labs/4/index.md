---
layout: page
title: "Lab 4: Ownership, Borrowing, &amp; Lifetimes"
---

## Lab 4: Ownership, Borrowing, &amp; Lifetimes

In today's lab we will introduce the Rust programming language,
and the core ideas Rust uses to ensure memory safety without manual
memory management or garbage collection. These core ideas are
ownership, borrowing, and lifetimes.

### Ownership

__Ownership__ is Rust's core mechanism for ensuring memory safety.
The way that Rust works is that each piece of data has an _owner_,
and when this owner goes out of scope, Rust knows the data can be
reclaimed.

```rust
fn main() {
    // This is how you get a pointer to 5 in Rust.
    // 5 is now allocated on the heap, and x is a
    // pointer to its memory location.
    let x = Box::new(5);

    // x goes out of scope here, and so the 5 on
    // the heap is automatically reclaimed,
    // without the programmer having to do anything.
}
```

Owners can also give ownership to another identifier:

```rust
fn main() {
    let x;

    {
        let y = Box::new(5);
        // this passes ownership to x.
        x = y;

        // y goes out of scope here, but ownership
        // has been transferred, and so the 5 on
        // the heap is not reclaimed yet.
    }

    // x goes out of scope here, and so the 5 on
    // the heap is reclaimed.
}
```

This also works across function calls.

```rust
fn blah(x: Box<i32>) {
    // ownership is passed into the function.
    // When the function ends, the 5 on the
    // heap will be reclaimed.
}

fn main() {
    let x = Box::new(5);
    blah(x);
}
```

By ensuring there is only one owner of any piece of data, Rust ensures it
can always correctly insert the memory reclamation.

### Borrowing

