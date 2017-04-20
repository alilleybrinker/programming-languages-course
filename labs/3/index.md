---
layout: page
title: "Lab 3: Effects"
---

# Lab 3: Effects

Welcome to the third and final lab using Haskell. In this lab, we will discuss effects, how to control them, and how a collection of typeclasses makes working with them more pleasant.

## Context

Until now, we’ve tiptoed around the type signature for the `main` function in Haskell. In case you were wondering, it looks like this:

```Haskell
main :: IO ()
```

This means that `main` is a function that takes in no parameters, and returns an `IO` struct containing nothing (indicated by `()`, the unit type, as discussed in the first lab).

So what is this `IO` struct? Think of it as a “context” in which a value of some type can be placed. When you do input-output in Haskell, it’s done in this `IO` context. So, for example, the function `putStrLn` looks like this:

```Haskell
putStrLn :: String -> IO ()
```

This means that `putStrLn` takes in a Haskell string, and returns an empty `IO` context (there’s no return value for printing something, so there’s no value for the `IO` context to hold after this operation).

If you’re doing input, say, to get a single character, it looks like this:

```Haskell
getChar :: IO Char
```

This means that `getChar` takes in no parameters, and returns a `Char` _in the `IO` context_.

`IO` actually comes with a bunch of functions for doing input-output. Here they are:

```Haskell
putChar :: Char -> IO ()
putStr :: String -> IO ()
putStrLn :: String -> IO ()
print :: (Show a) => a -> IO ()

getChar :: IO Char
getLine :: IO String
getContents :: IO String
interact :: (String -> String) -> IO ()

type FilePath = String
readFile :: FilePath -> IO String
writeFile :: FilePath -> String -> IO ()
appendFile :: FilePath -> String -> IO ()
readIO :: Read a => String -> IO a
readLn :: Read a => IO a
```

Notice that _all_ the functions doing output return some `IO ()`, while _all_ the functions getting input return some `IO` type (`Char` or `String`, depending on whether you’re getting a character or string).

_All input-output in Haskell goes through these `IO` functions._

## Operating in the Context

The question then is what to do with the context once you have it. For example, let’s say you have some `IO Char` value, and want to modify the character inside. How would you do that? You need some way to modify the value inside, maybe like this:

```Haskell
modify :: IO Char -> IO Char
modify (IO c) = IO (toLower c)
```

But hey, doesn’t it seem weird to have a function that only works for `IO` characters? Let’s split out the part specific to `IO` from the part specific to `Char`:

```Haskell
modifyIO :: IO Char -> IO Char
modifyIO c = mapIO modify c

mapIO :: (a -> b) -> IO a -> IO b
mapIO f (IO x) = IO (f x)

modify :: Char -> Char
modify c = toLower c
```

So now we have a pure, non-`IO` function for modifying the character, and a generic function for applying the non-`IO` function in the `IO` context!

It turns out there are other places this same pattern can be used. What if we have a value of type `Maybe Char`, and we want to modify the `Char` in the same way we just did with `IO`. It looks like this:

```Haskell
modifyMaybe :: Maybe Char -> Maybe Char
modifyMaybe c = mapMaybe modify c

mapMaybe :: (a -> b) -> Maybe a -> Maybe b
mapMaybe f (Just x) = Just (f x)
mapMaybe f (Nothing) = Nothing

modify :: Char -> Char
modify c = toLower c
```

Hang on! `mapMaybe`’s type signature is almost identical to the one for `mapIO`! Can we make a function that works for both? We can!

```Haskell
class Functor f where
    fmap :: (Functor f) => (a -> b) -> f a -> f b
```

That’s it! We’ve defined a new type class, called `Functor` that contains one function, `fmap`, which is the generic version of those `mapIO` and `mapMaybe` functions we wrote ourselves. It turns out that both the `IO` type and `Maybe` type are `Functors`! In fact, any type that can be mapped over in the same way is a functor, meaning we can operate on values in the context of that type, without polluting the functions we’re applying by forcing them to know things about the context.

## Sequencing Contextual Operations

Okay, so we can operate on a value in a context, without having to mess up our functions by making them care about the context itself. What if we want to sequence contextual operations? Can we do it?

Imagine we have a function in a context, like so:

```ghci
$ let x = Just (+ 3)
x :: (Num a ) => Maybe (a -> a)
```

We now have a function that maps numbers to numbers, inside the `Maybe` context. Unfortunately, we can’t give this function to `fmap`, because its type signature is wrong! It expects a function `(a -> b)`, not `f (a -> b)`. But could we write a function that _does_ work with `x`?

```Haskell
class Functor f => Applicative f where
    pure  :: a -> f a
    (<*>) :: (Applicative f) => f (a -> b) -> f a -> f b
```

We’ll call `<*>` “apply.” “Apply” is a function that takes in a function in a context, a value in the same context, and uses the function to modify the value, returning a new value, still in the same context. `pure` is a simple function to take a value and put it into the context.

But just what kind of context is it? Well, it’s an applicative one! An applicative context is a context that can implement the `Applicative` typeclass. Simple as that.

But how does this help with sequencing? Well, let’s look at `Applicative Maybe`!

```Haskell
instance Applicative Maybe where
    pure x = Just x

    (<*>) (Just f) x = fmap f x
    (<*>) (Nothing) _ = Nothing
```

So `pure` simply wraps the value in a `Just`, and “apply” applies the function if it’s there, or passes on `Nothing` if there’s no function. Let’s see it in action!

```ghci
$ pure (+) <*> Just 3 <*> Just 5
Just 8
$ pure (+) <*> Just 3 <*> Nothing
Nothing
$ pure (+) <*> Nothing <*> Just 5
Nothing
```

So, `pure (+)`, takes `(+)` (which has type `Num a => a -> a -> a`) and puts it into the `Maybe` context, resulting in a value of just `Num a => Maybe (a -> a -> a)`.

“Apply” then first applies the function to a value of type `Maybe 3`, resulting in a value of type `Num a => Maybe (a -> a)`, thanks to partial application.

The second “apply” applies the function to `Just 5`, resulting in a value of type `Maybe a`. In this case, the value is `8`, which is the result of `3 + 5`.

That is how `Applicative` provides sequencing! With partial application, you give it a function with multiple parameters, and then _apply_ that function to those parameters, all while staying in the same context! And thanks to `pure`, you still don’t need to pollute your functions by making them care about the context in which they’ll be applied!

### Working with Contextual Functions

So, we know how to apply a pure function to a contextual value (with `fmap`), and we know how to apply a contextual function to contextual values. But what if we have a function like `putChar`, from earlier?

Remember, `putChar` has the following type signature:

```Haskell
putChar :: String -> IO ()
```

This function takes in a pure value and returns a contextual value. This type signature isn’t quite right for a `Functor`, and it’s not quite right for an `Applicative`. What is it?

```Haskell
class Applicative f => Monad f where
    (>>=) :: f a -> (a -> f b) -> f b
```

This function, which we’ll call “bind,” takes in a contextual value, and a function (like `putChar`) from a pure value to a contextual value, and returns a contextual value. Using it might look like this:

```Haskell
$ pure 'a' >>= putChar
```

`pure 'a'` gives us a value of type `IO Char`, and `putChar` has the type `Char -> IO ()`. These match up perfectly with “bind”! So `IO` is a monad!

With the monad, we have the ability to sequence operations together! To show this, let’s write a little helper function, which we’ll call “sequence”:

```Haskell
(>>) :: Monad f => f a -> f b -> fb
(>>) x y = x >>= (\_ -> y)
```

This function says to run `x` first, throw away the result, and then run `y`. So, if we wanted to print multiple characters, it could look this this!

```Haskell
$ (pure 'a' >>= putChar) >> (pure 'b' >>= putChar)
```

In fact, Haskell provides a convenient notation for sequencing `IO` operations, that desugars into exactly this!

```Haskell
main = do
    x <- getLine
    putStrLn ("You typed: " ++ x)
```

This turns into:

```Haskell
main = getLine >>= (\x -> putStrLn ("You typed: " ++ x))
```

None of this is specific to `IO`! We can actually use it for any type that implements the `Monad` interface, like `Maybe` or `[]` (the list type).

### Conclusion

So, we make sure effects can only happen inside a particular context by having all the functions with effects only operate in that context. Then we use `Functor`, `Applicative`, and `Monad` to make working with those contexts nice and easy, giving us the ability to operate on contextual values (with `Functor`), sequence contextual operations (with `Applicative`), and have that sequencing carry values (with `Monad`). Collectively, these provide an extremely strong and useful interface for controlling effects.

__For this lab, I want something a little different. Please type a response to the following question: “what makes `Functor`, `Applicative`, and `Monad` different? Why are all `Applicative`s inherently `Functor`s, and why are all `Monad`s inherently `Applicative`s (and therefore _also_ `Functor`s). Email this typed response to me, as a PDF, before the next lab.”__