# How to write effective if statements in TypeScript

I write this article just to sum up my opinion and experience with the use of logical operators inside TypeScript. We use them as if conditions most of the times, but there are much more in them, than newcomers may see at first.

## Truthy and Falsy, the two sides of the coin

Truthy values are considered true in a Boolean context, so if we use them as an if condition the if block will run. In contrast, falsy values will act as false inside an if condition.

In JavaScript, and essentially in TypeScript as well, there are several values considered "truthy". As MDN states:

>In JavaScript, a truthy value is a value that is considered true when encountered in a Boolean context. All values are truthy unless they are defined as falsy.

So... Everything is Truthy, unless they are not. Well, obviously... Fortunately MDN helps us out with the falsy values:

 - The boolean `false` value
 - The number `0` and `0n` BigInt
 - The empty string: `""`
 - The `null` and `undefined` value
 - and `NaN`

 Much cleaner, so everything is truthy if they are not listed above.

 **Note: There is no such thing as a "List of truthy values in JS" This is because even in the ES5 specs the truthy values are specified just like this. If a value is inside the falsy list, then it is falsy if it is not, then it is truthy. Any exception (which I am aware of) is coming from the browser.**

 Now that we've went through the basics, let's dig deeper.

 ## The `||` and `&&` operators

 If you ever used some kind of programming language, then you've probably met with these operators. These are respectively the logical or and the logical and operators. Most of the times newbie JavaScript devs assume these are working just the same as in any other languages. Looking at the bigger picture this is true, but from a closer look they are not the same.

 The biggest difference is that these operators in JavaScript are not necessarily results in boolean values. They always produce a value of one of the two operands (or the value of on of the two operand expressions).

 Let's see some examples:

 ```js
var a = 42;
var b = null;
var c = "foo";

a || b;     // 42
a || c;     // 42
b || c;     // "foo"

a && b;     // null
a && c;     // "foo"
b && c;     // null
```

Both of these operators perform a boolean test on the first operand, and will apply normal coercion to boolean if they aren't already boolean values.

The `||` operator if this test is true will result in the **value of the first operand**. If it is false, then it will result in the **value of the second operand**.

On the contrary, the `&&` if this test is true, will result in the **value of the second operand**. If the test is false, then it will result in the **value of the first operand**.

Thus, again, the result of these operands is **always** one of the underlying values of the operands.

In JavaScript we tipically use these behaviors for null checking and to provide fallback values for variables. Altough, because there are more falsy values, than just the null, this is a bit different, than let's say the "null coalescing operator of C#. Let's see an example:

```JS
function welcomeUser(welcomePhrase, name) {
    welcomePhrase = welcomePhrase || 'Hello';
    name = name || 'User';

    console.log(`${welcomePhrase} ${name}`);
}

welcomeUser("Hi!", "");      // Hi! User
```

Since the `""` is a falsy value the boolean test on the `name` will be false, thus the `||` will result in the value of the second argument, the `'User'`. Which is probably was not the intent of the user of this function. However, I don't want to state here, that using this is the first circle in programmers' hell. Just make sure, that you know what you do, when you use them. Do not blindly copy paste them into your code base, **assuming** you know what they do.

## The `==` and `===` checks

The difference between these two operators are really basic questions to ask in interviews. The usual answer is:

**A Common MISCONCEPTION**
> The "===" is ckecking both the values and the types for equality, while "==" only checks the values".

This description is really misleading, since it's suggesting that the "===" is making the more work. While in reality it is a bit different. A correct description is as follows:

> The "==" operator allows coercion in the equality comparison and the "===" disallows coercion.

So in reality, the "==" is doing more work, than the "===" operator. This may lead to you to an other trap, that the "==" is less perfomant, than the "===" operator. Altough, there is a small measurable cost of the coercion, we are talking about mere microseconds. (Yes, microseconds, not mlliseconds, that is millionths of a second)

When you are comparing two values of the same types, then there is no difference in the "===" and the "==" operators. They are using the same algorithm under the hood, other than minor differences in engine implementation.

### The "==" operator or Abstract Equality

The behavior of the "==" operator is defined as the "Abstract Equality Comparison Algorithm". The section of ES5 spec. where this is specified contains a comprehensive, but simple algorithm which states how the coercion is working on every possible types.

A lot of confusion is coming from this part of the JavaScript ecosystem. Generally, this is said to be too complex and too unintuitive to use, and prone to make more bugs, than enabling better readability.

Let's go through the above mentioned algorithm from top to bottom (as it is in the ES5 specs).

The first two points are generally saying, that if the values to be compared are of the same type, so there is no need to coerce the values, then theay are simply compared via identity. So, 42 only equals to 42 and "abc" to "abc". Just like you would expect (from "===").

There are some minor exceptions, however:
 - NaN is never equals to itself
 - +0 and -0 are equal to each other

Also, to sum up the simple parts. Loose equality comparison with objects (including functions and arrays) are only true if they are referencing the same values.

Now, walk through the (not much more) complicated parts of this algorithm. These are specifiying, that if you compare values of different types one or both of the values need to be (implicitly) coerced.

**Comparing string to number**
```js
var x = 42;
var y = "42";

x === y;    // false
x == y;     // true
y == x;     // true
```

As the ES5 spec, clauses 11.9.3.4-5 say:
> 4. If Type(x) is Number and Type(y) is String, return the result of the comparison x == ToNumber(y).
> 5. If Type(x) is String and Type(y) is Number, return the result of the comparison ToNumber(x) == y.

So, if one of the values are string and the other is number, then the string will be coerced to number, then regular comparison will be done.

So, in the above example, the value "42" will be coerced to the number 42. Which is obviously equals to x.

**Comparing *anything* to boolean**
Let's start with an example:

```js
var x = "42";
var y = true;
var z = false;

x == y;     // false
y == z;     // false
```

You may be surprised by this, because at the start of this article we stated that the "42" value, because it is not listed as falsy, is truthy. So, then you might think that here: `"42" == true` should be true. Let's see what the ES5 spec say about this.

> 6. If Type(x) is Boolean, return the result of the comparison ToNumber(x) == y.
> 7. If Type(y) is Boolean, return the result of the comparison x == ToNumber(y).

So, if one of the values are booleans, then it will be coerced to a number. Let's go through the example above:

The type of y is boolean, so it will be coerced to a number. Since it is true, then it will be coerced to 1. However, the types of the values are still different, but this time we are comparing a number to a string. Thus, the string will be coerced to the number 42. Since 1 is obviously not equals to 42 the result will be false.

As you could guess it, the result of the second comparison will still be false, because the false will be coerced to the number 0. Okay, wait a second here. This means that "42" is neither == false nor == true. But how can a value be neither truthy nor falsy?

It is because you're brain tricks you. If you read the ES5 specs again you will realize, that there is no boolean coercion here at all. Instead the boolean value will be coerced to a number.

Because of this, you should avoid using `x == false` or `x == true` or if you know that one of the types will be boolean, while the other might be of an other type. In practice this will almost always introduce some bugs later on. 