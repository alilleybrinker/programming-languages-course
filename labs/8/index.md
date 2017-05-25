---
layout: page
title: "Lab 8: Object–Oriented Design"
---

# Lab 8: Object–Oriented Design

In this lab we will be talking about some common and important concepts and patterns in object–oriented design. These are not specific to Java, but we will of course be using Java as the illustrating language.

## The SOLID Principle

SOLID is an acronym for five of the most important ideas in object–oriented design:

- Single Responsibility Principle
- Open/Closed Principle
- Liskov Substitution Principle
- Interface Segregation Principle
- Dependency Inversion Principle

Unfortunately, all of these names are terrible. Let’s walk through what they actually mean.

### Single Responsibility Principle

The single responsibility principle says that every class should only do one thing. Put more concretely, it means that only one change in the specification of the software should be able to induce a change in the implementation of the class. Here is an example of some code that fails to follow the single responsibility principle, followed by code that does follow the principle:

```java
import java.lang.*;

class Person {
	public String name;
	public String surname;
	public String email;

	public Person(String name,
                  String surname,
                  String email) {
		this.name = name;
		this.surname = surname;

		if (validateEmail(email)) {
			this.email = email;
		} else {
			throw new RuntimeException();
		}
	}

	private boolean validateEmail(String email) {
		// does the email validation.
		return true;
	}
}
```

```java
import java.lang.*;

class Email {
    public String email;

    public Email(String email) {
        if (validateEmail(email)) {
            this.email = email;
        } else {
		    throw new RuntimeException();
        }
    }

	private boolean validateEmail(String email) {
		// does the email validation.
		return true;
    }
}

class Person {
	public String name;
	public String surname;
	public Email email;

	public Person(String name,
                  String surname,
                  Email email) {
		this.name = name;
		this.surname = surname;
        this.email = email;
	}
}
```

### Open/Closed Principle

The Open/Closed Principle says that classes should be open for extension but closed for modification.

Here is a good example:

```java
// Open-Close Principle - Bad example
 class GraphicEditor {

 	public void drawShape(Shape s) {
 		if (s.m_type==1)
 			drawRectangle(s);
 		else if (s.m_type==2)
 			drawCircle(s);
 	}
 	public void drawCircle(Circle r) {....}
 	public void drawRectangle(Rectangle r) {....}
 }

 class Shape {
 	int m_type;
 }

 class Rectangle extends Shape {
 	Rectangle() {
 		super.m_type=1;
 	}
 }

 class Circle extends Shape {
 	Circle() {
 		super.m_type=2;
 	}
 }
```

And here is a bad example:

```java
// Open-Close Principle - Good example
 class GraphicEditor {
 	public void drawShape(Shape s) {
 		s.draw();
 	}
 }

 class Shape {
 	abstract void draw();
 }

 class Rectangle extends Shape  {
 	public void draw() {
 		// draw the rectangle
 	}
 }
```

### Liskov Substitution Principle

The Liskov Substitution Principle says that for some type `S`, all subtypes of `S` must be substitutable in place of `S`.

Here is some example code which violates the principle:

```java
void SomeMethodWhichViolatesLSP(IVehicle aVehicle) {
   if (aVehicle is Car) {
      var car = aVehicle as Car;
      // this method is not on the IVehicle interface
      car.ChangeGear();
    }
    // etc.
 }
```

In this example, the code’s behavior changes if given a specific subtype of some specific type. This is a violation of Liskov.

### Interface Segregation Principle

The Interface Segregation Principle says that users of an interface shouldn’t have to depend on parts of the interface they don’t use. This is quite similar to the Single Responsibility Principle, but from the perspective of the user. Here is an example that doesn’t follow this principle:

```java
// interface segregation principle - bad example
interface IWorker {
	public void work();
	public void eat();
}

class Worker implements IWorker{
	public void work() {
		// ....working
	}
	public void eat() {
		// ...... eating in launch break
	}
}

class SuperWorker implements IWorker{
	public void work() {
		//.... working much more
	}

	public void eat() {
		//.... eating in launch break
	}
}

class Manager {
	IWorker worker;

	public void setWorker(IWorker w) {
		worker=w;
	}

	public void manage() {
		worker.work();
	}
}
```

And here is an improved example:

```java
// interface segregation principle - good example
interface IWorker extends Feedable, Workable {}

interface IWorkable {
	public void work();
}

interface IFeedable{
	public void eat();
}

class Worker implements IWorkable, IFeedable {
	public void work() {
		// ....working
	}

	public void eat() {
		//.... eating in launch break
	}
}

class Robot implements IWorkable{
	public void work() {
		// ....working
	}
}

class SuperWorker implements IWorkable, IFeedable {
	public void work() {
		//.... working much more
	}

	public void eat() {
		//.... eating in launch break
	}
}

class Manager {
	Workable worker;

	public void setWorker(Workable w) {
		worker = w;
	}

	public void manage() {
		worker.work();
	}
}
```

### Dependency Inversion Principle

The Dependency Inversion Principle is the worst-named of the principles, and says the following:

> 1. High-level modules should not depend on low-level modules. Both should depend on abstractions.
> 2. Abstractions should not depend on details. Details should depend on abstractions.

Here is a bad example:

```java
// Dependency Inversion Principle - Bad example
class Worker {
	public void work() {
		// ....working
	}
}

class Manager {
	Worker worker;

	public void setWorker(Worker w) {
		worker = w;
	}

	public void manage() {
		worker.work();
	}
}

class SuperWorker {
	public void work() {
		//.... working much more
	}
}
```

And here is a good example:

```java
// Dependency Inversion Principle - Good example
interface IWorker {
	public void work();
}

class Worker implements IWorker{
	public void work() {
		// ....working
	}
}

class SuperWorker  implements IWorker{
	public void work() {
		//.... working much more
	}
}

class Manager {
	IWorker worker;

	public void setWorker(IWorker w) {
		worker = w;
	}

	public void manage() {
		worker.work();
	}
}
```

Notice that the `IWorker` construct has been added, so that the Manager is no longer tied to the particular type of worker.

## Conclusion

These are the components of SOLID. Understanding these is important to the creation of good OO programs, and fulfilling the promise of OO programming facilitating the creation of large programs.

## Assignment

__For this lab, please write your own original examples of each of these principles, along with explanations in your own words of what the principle is, and why it’s desirable. Submit the examples as `.java` files, and the explanations as `.pdf` files. Due by Thursday, June 1st at 4pm.__

## Credits

Many of these code examples are drawn from [OODesign.com](http://www.oodesign.com/design-principles.html).