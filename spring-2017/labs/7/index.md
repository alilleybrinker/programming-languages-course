---
layout: page
title: "Lab 7: Objects &amp; Classes"
---

# Lab 7: Objects &amp; Classes

In this lab we will cover classes, objects, subclassing, composition vs. inheritance, subtype polymorphism, and abstract data types.

## Compilation

This is our first lab with Java, so before anything else, let’s talk a bit about how compilation works in Java.

In Java, you write separate `.java` files, each of which contains a single class. The name of the file _must_ exactly match the name of the class contained within; so a file called `Blah.java` _must_ contain a class called `Blah`.

Java files are compiled using `javac` (the Java compiler), which results in a `.class` file for each compiled `.java` file. The resulting `.class` file can be executed with the `java` command. In order for a class to be executed this way, it must define the following function:

```java
public static void main(String argv[]) {}
```

This is the function which will be executed when the `.class` file is executed.

This is a basic hello world program in Java:

```java
import java.lang.*;

public class Hello {
    public static void main(String argv[]) {
        System.out.println("Hello, World!");
    }
}
```

## Classes and Objects

As you can see, you declare classes in Java with the `class` keyword. Classes that are intended to be public must also have the `public` annotation.

On methods, `public` means that the method is publicly accessible to other objects. `static` means it is a “class” method, defined on the class rather than on individual instances. This can be used like so:

```java
import java.lang.*;

class Counted {
    private static int x = 0;
    public Counted() { ++x; }
    public static int getCount() { return x; }
}

public class Static {
    public static void main(String argv[]) {
        Counted c1 = new Counted();
        Counted c2 = new Counted();
        Counted c3 = new Counted();
        System.out.println("count: " + Counted.getCount());
    }
}
```

The count printed at the end will be `3`, because the counter is shared among all instances of the class.

Note that this also shows how to create instances of an object, and how to define constructors. In this case there is only one constructor for `Counted`, which takes no parameters.

## Subclassing & Subtype polymorphism

Subclassing is quite straightforward, and looks like this:

```java
import java.lang.*;

class Parent {
    public String role() { return "parent class"; }
}

class Child extends Parent {
    public String role() { return "child class"; }
}

class RolePrinter {
    public void printRole(Parent p) {
        System.out.println(p.role());
    }
}

public class Sub {
    public static void main(String argv[]) {
        RolePrinter r = new RolePrinter();

        Parent p = new Parent();
        Child c = new Child();

        r.printRole(p);
        r.printRole(c);
    }
}
```

Note that this code _also_ shows how subtype polymorphism works! `Child` is a subclass of `Parent` (put another way, `Child` inherits from `Parent`) and can be passed to any method (like `printRole`) which takes a `Parent` type as a parameter! This is subtype polymorphism.

## Composition vs. Inheritance

You are likely at some point to hear about the composition as an alternative to inheritance, with someone saying that inheritance is terrible and you should always use composition.

Inheritance and composition model two different class relationships. Inheritance models an “is-a” relationship, while composition models a “has-a” relationship. Here’s an example:

```rust
class Engine {}
class TransportMechanism {}
class Bicycle extends TransportMechanism {}
class Car extends TransportMechanism {
    private Engine engine;
}
```

Both `Bicycle` and `Car` are `TransportMechanism`s, but only `Car` has an `Engine`. So `Bicycle` and `Car` use inheritance with `TransportMechanism`, while only `Car` uses composition for an `Engine`.

We’ll get more into object-oriented design next week, but this is the core idea when it comes to composition vs. inheritance. The right choice is going to depend on what you’re modeling.

## Abstract Data Types

You can define abstract data types in Java, which define a particular type of data with a particular interface for modification and access, and which must then be implemented to provide a concrete representation of that data. For example:

```rust
import java.lang.*;
import java.util.*;

abstract class Bag {
    abstract void add(Object item);
    abstract void remove(Object item);
    abstract boolean contains(Object item);
    abstract Object grab();
}

class ArrayBag extends Bag {
    private Object[] items;

    public void add(Object item) {}
    public void remove(Object item) {}
    public boolean contains(Object item) { return true; }
    public Object grab() { return items[0]; }
}

class ListBag extends Bag {
    private List<Object> items;

    public void add(Object item) {}
    public void remove(Object item) {}
    public boolean contains(Object item) { return true; }
    public Object grab() { return items.toArray()[0]; }
}

public class Interface {
    static void doBagThings(Bag bag) {}

    public static void main(String argv[]) {
        ArrayBag ab = new ArrayBag();
        ListBag lb = new ListBag();

        doBagThings(ab);
        doBagThings(lb);
    }
}
```

In this example, we define an abstract data type `Bag`, along with two concrete versions of it: `ArrayBag` and `ListBag`, which each have their own data representation (`Object[] items` and `List<Object> items`, respectively). This is how abstract data types work.

## Lab Assignment

__For today’s lab, please write a Java program that includes inheritance, composition, subtype polymorphism, an abstract data type, and at least two implementations of that abstract data type. Please also provide an explanation of the relationships between the different classes, and why each relationship is modeled in the way you choose to model it. Provide the explanation as a PDF file, and the code as a single `.java` file. These are both due next Tuesday by 4pm.__

