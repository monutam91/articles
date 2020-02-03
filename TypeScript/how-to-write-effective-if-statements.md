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
