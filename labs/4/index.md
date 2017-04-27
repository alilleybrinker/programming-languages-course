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

Borrowing is what stops the ownership system from being a complete pain
to use. Not every function needs to own data it's working with. Most
functions can instead work with a _reference_, via _borrowing_.

References in Rust are just pointers with two rules:

1. References are never null. (Rust actually doesn't have null in the language)
2. There can _either_ be (a) infinite immutable references _or_ (b) exactly one mutable reference.

Here is an example of borrowing.

```rust
fn blah(x: &i32) {
   // do something...
}

fn main() {
    let x = 5;
    blah(&x);
}
```

And

```rust
fn main() {
    let x = 5;
    let y = &x;
    let z = &x;
    let a = &mut x; // Woah there!
}
```

Also

```rust
fn main() {
    let x = 5;
    let y = &mut x;
    let z = &mut x; // can't have >1
}
```

In the above code, `blah` gets a _reference_ to `x`. Put another way, `blah` borrows `x`. The rules
for when memory reclamation happens are still the same, because Rust guarantees the owner always
_outlives_ the borrows. How does Rust ensure this? Through lifetimes!

### Lifetimes

Every identifier in Rust has an associated lifetime, which you can think of as a _named scope_.

```rust
fn main() { // Lifetime 'a start
    // x has lifetime 'a
    let x = 4;

    { // Lifetime 'b start
        // y has lifetime 'b
        let y = 6;

    } // Lifetime 'b end
} // Lifetime 'a end
```

Rust tracks these lifetimes to make sure that the code is safe. For example:

```rust
fn dangling() -> &i32 { // Lifetime 'a start
    // x has lifetime 'a
    let x = 4;

    // Oh no! x won't exist after the function ends!
    &x
} // Lifetime 'a end
```

Rust catches that the above function is unsafe __at compile time__, because
it sees that the reference to `x` has a longer lifetime than `x` itself,
which is not allowed.

### Conclusion

These are the three core ideas of Rust's safety system, and together they enable
Rust to be high performance with no manual memory management and no garbage
collection.

__For today's lab, fix all the code in the [&ldquo;Move Semantics&rdquo;][move] section
of Rustlings to make it compile correctly. Submit your working code by the end
of the lab period, by email.__

[move]: https://github.com/carols10cents/rustlings#move-semantics

