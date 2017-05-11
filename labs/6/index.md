---
layout: page
title: "Lab 6: Safety &amp; Security"
---

# Lab 6: Safety & Security

In this lab we will walk through the ways in which Rust’s design facilitates safety, how Rust’s safety guarantees interact with its low-level programming capabilities, and how Rust’s definition of safety interacts with our understanding of security in low-level programming.

## Safe Rust vs. Unsafe Rust

Rust is actually split into two languages: Safe Rust and Unsafe Rust. So far in this class we’ve been working with Safe Rust, but in this lab we’re going to get into Unsafe Rust.

The key difference between Safe Rust and Unsafe Rust is that in Safe Rust, the compiler checks your work. It makes sure that nothing you write violates the rules Rust has. In Unsafe Rust, the compiler doesn’t check everything, and instead just assumes you’ve checked the code yourself.

Unsafe Rust is used when you have code that is safe, but which the compiler can’t prove is safe. (Remember, there is a difference between truth and provability, as we discussed in a previous lecture.)

Before we go further, let’s [take a look at how Safe Rust and Unsafe Rust relate](https://doc.rust-lang.org/nomicon/safe-unsafe-meaning.html).

## What is Safety?

It’s important to establish what “safety” means in the context of Rust. This definition is given in the official [Rust reference][reference], which says the following:

1. Data races
2. Dereferencing a null/dangling raw pointer
3. Reads of undef (uninitialized) memory
4. Breaking the pointer aliasing rules with raw pointers (a subset of the rules used by C)
5. `&mut T` and `&T` follow LLVM’s scoped `noalias` model, except if the `&T` contains an `UnsafeCell<U>`. Unsafe code must not violate these aliasing guarantees.
6. Mutating non-mutable data (that is, data reached through a shared reference or data owned by a let binding), unless that data is contained within an `UnsafeCell<U>`.
7. Invoking undefined behavior via compiler intrinsics:
	1. Indexing outside of the bounds of an object with `std::ptr::offset` (offset intrinsic), with the exception of one byte past the end which is permitted.
	2. Using `std::ptr::copy_nonoverlapping_memory` (`memcpy32`/`memcpy64` intrinsics) on overlapping buffers
8. Invalid values in primitive types, even in private fields/locals:
	1. Dangling/null references or boxes
	2. A value other than `false` (`0`) or `true` (`1`) in a bool
	3. A discriminant in an enum not included in the type definition
	4. A value in a char which is a surrogate or above `char::MAX`
	5. Non-UTF-8 byte sequences in a `str`
9. Unwinding into Rust from foreign code or unwinding from Rust into foreign code. Rust's failure system is not compatible with exception handling in other languages. Unwinding must be caught and handled at FFI boundaries.

## Safety and Security

Failures of safety as defined above can and do lead to real world security issues.

__For this lab, I want you to find a real world security flaw that could have been prevented with the memory safety guarantees Rust provides, and then write about it. Submit a PDF report on it to me via email by 4pm next Thursday. The report should describe the vulnerability, and the memory safety issue it connects with.__

The [CVE][cve] and [CWE][cwe] databases are a good place to start looking for vulnerabilities.

[reference]: https://doc.rust-lang.org/stable/reference/behavior-considered-undefined.html
[cve]: http://cve.mitre.org/
[cwe]: http://cwe.mitre.org/

