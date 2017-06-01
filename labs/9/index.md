---
layout: page
title: "Lab 9: Unification &amp; Backtracking"
---

# Lab 9: Unification & Backtracking

Welcome to the first of two labs on Prolog! Prolog is a language very different from the ones you've seen so far. Don't worry too much about being productive in it. Just try and focus on the ideas from Prolog that we're focusing on. (Of course, if you find it interesting, then by all means dive in deeper than we go in these labs!)

Prolog is a _logic programming language_, this is a programming paradigm that looks like and works similarly to formal logic.

Before we dive deeper, let's talk a bit about logic.

## A Bit of Logic

There are many different "logics" (logical languages with different axioms and rules). At the most basic, you have propositional logic, which looks something like this:

> Jim is a human.
> All humans have brains.
> Jim has a brain.

Notice that there are no variables, just simple statements. Propositional logic is easy to work with, but also not super useful.

Next you have predicate logic, also called first-order logic, which allows statements of the form "there exists" and "for all." This is called _quantification_. First-order logic is called "first-order" because quantification can only be applied to objects in the "domain of discourse." There is also second-order logic, where quantification can be applied to objects and relations as well.

Prolog can be seen as an adaptation of first-order logic. So you can have quantification over objects but not relations.

## Prolog!

Prolog is a _declarative_ language. You declare _facts_ and _rules_, and the language uses these to perform the computation without you explicitly telling it what computation to perform. Computation in Prolog works by querying the collection of defined facts and rules.

### An Example Program

Here's a really simple Prolog program:

```prolog
cat(tom).
animal(X) :- cat(X).
?- cat(tom).
?- cat(X).
?- animal(X).
```

Here's another:

```prolog
mother_child(trude, sally).
father_child(tom, sally).
father_child(tom, erica).
father_child(mike, tom).
sibling(X, Y)      :- parent_child(Z, X), parent_child(Z, Y).
parent_child(X, Y) :- father_child(X, Y).
parent_child(X, Y) :- mother_child(X, Y).
?- sibling(sally, erica).
```

### How does this work?

To understand how this works, you need to understand two ideas: _unification_ and _backtracking_. Unification is the process Prolog goes through to match facts and rules together. To understand it, let's look at the following code:

```prolog
woman(mia).
?- woman(X).
```

To provide an answer, this code needs to unify the query with a succession of facts or rules. "Two terms unify if they are the same term or if they contain variables that can be uniformly instantiated with terms in such a way that the resulting terms are equal." So in this example, `woman(X)` and `woman(mia)` are not the same term, but `woman(X)` can be instantiated such that it equals `woman(mia)`, and so the two unify. This means that `X` is determined to be `mia`, which is in fact the result such a query returns!

Let's take a quick look at [Learn Prolog Now](http://www.learnprolognow.org/lpnpage.php?pagetype=html&pageid=lpn-htmlse5), which has a nice explanation of this.

So, Prolog works by using attempting to unify your query with a successive collection of rules and facts until a valid result is achieved. Of course, we need a way to make sure the unification doesn't get stuck! Enter _backtracking_.

### Backtracking

Backtracking is the process by which Prolog reaches its final determination for a particular query. The unification system recurses through goals and subgoals, and if it reaches a dead-end, it _backtracks_ back to the last usable spot in the search, and starts from there, making sure not to repeat the failed unification attempts it had previously made.

You can think of goals and subgoals like a tree. When the query system hits a unification failure, it goes back up the tree toward the root until it hits a point with other branches to do down.

### All together now

Unification and backtracking together are how Prolog answers your queries. You ask it a question, and it then recursively unifies goals and subgoals, backtracking when necessary, until it either reaches an answer or finds that no answer can be reached.

## Assignment

Today's assignment is to use the following Prolog program to solve a murder:

```prolog
% In Elementary Pascal Ledgard & Singer have Sherlock Holmes program
% the Analytical Engine to confirm the identity of the murderer of
% a well known art dealer at the Metropolitan Club in London.
% The murderer can be deduced from the following apparently trivial
% clues.
murderer(X):-hair(X, brown). % the murderer had brown hair

attire(mr_holman, ring). % mr_holman had a ring
attire(mr_pope, watch).  % mr_pope had a watch.

attire(mr_woodley, pincenez):-attire(sir_raymond, tattered_cuffs). % If sir_raymond had tattered cuffs then mr_woodley had the pincenez spectacles
attire(sir_raymond, pincenez):-attire(mr_woodley, tattered_cuffs). % and vice versa

attire(X, tattered_cuffs):-room(X, 16). % A person has tattered cuffs if they were in room 16.

hair(X, black):-room(X, 14). % A person has black hair if they were in room 14.
hair(X, grey):-room(X, 12).
hair(X, brown):-attire(X, pincenez).
hair(X, red):-attire(X, tattered_cuffs).

room(mr_holman, 12). % mr_holman was in room 12
room(sir_raymond, 10).
room(mr_woodley, 16).
room(X, 14):-attire(X, watch).

:- nl, nl, write('The game is afoot....'), nl, nl.
```

You can run Prolog with the command `swipl`, and load this file (named `murder.plg`) with the command `consult('murder.plg').`. You can then use commands like the following to collect information for yourself:

```prolog
listing(murderer).
listing(room).
listing(attire).
listing(hair).
```

And then use `trace, murderer(X).` to show who committed the crime, and how Prolog solved it.

Do this, and then submit a PDF with an explanation of who the murderer is, and how Prolog figured it out (explaining each step of the trace). Due by end of class.
