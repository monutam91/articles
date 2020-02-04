# How does coercion and comparisons work in JavaScript (Part 1)

I work as a senior Web Developer right now. As someone who works in this role, I consider one of my main goals is to educate other developers and eventually prepare them to become senior devs. I personally think, that if you want to become a senior on the web, you need to know the JavaScript inside and out. That is why I want to create a list of articles going into the depths of the JavaScript. Also, I do not want to just toss aside topics or edge cases, with reasoning like: `You should never use it, because it is just bad and confusing.`. You as a senior, a talented and experienced developer, should be prepared to use any part of your chosen ecosystem. Also, there isn't really a "bad part" of any langugage or ecosystem, you just don't know enough about it. With the reasoning like I mentioned above, you can easily push aside features, that might have been really helpful to use, if you would have know more about it.

Okay, so let's dive into our first topic. Which is the cause of a lot of confusion and bugs in any kind of JavaScript application.

I also have to mention, that I heavily rely on [Kyle Simpson's - You don't know JS](https://github.com/getify/You-Dont-Know-JS) book. I can not recommend his book enough, he really dug deep into the depth of JavaScript and wrote really cool books about every aspect of it. If you want to know every aspect of this ecosystem, head straigth to his books, they are really cool to read.

## Truthy and Falsy, the two sides of the coin

Truthy values are considered true in a Boolean context, so if we use them as an if condition the if block will run. In contrast, falsy values will act as false inside an if condition.

In JavaScript, there are several values considered "truthy". As MDN states:

> In JavaScript, a truthy value is a value that is considered true when encountered in a Boolean context. All values are truthy unless they are defined as falsy.

So... Everything is Truthy, unless they are not. Well, obviously... Fortunately MDN helps us out with the list of falsy values:

 - The boolean `false` value
 - The number `0` and `0n` BigInt
 - The empty string: `""`
 - The `null` and `undefined` value
 - and `NaN`

 Much cleaner, so everything is truthy if they are not listed above.

 **Note: There is no such thing as a "List of truthy values in JS" This is because even in the ES5 specs the truthy values are specified just like this. If a value is inside the falsy list, then it is falsy if it is not, then it is truthy. Any exception (which I am aware of) is coming from outside of JS.**

 Now that we've went through the basics, let's dig deeper.

 ## The `||` and `&&` operators

 If you ever used some kind of programming language, then you've probably met with these operators. These are respectively the logical or and the logical and operators. Most of the times newbie JavaScript devs assume these are working just the same as in any other languages. Looking at the bigger picture this is true, but from a closer look they are not the same.

 The biggest difference is that these operators in JavaScript are not necessarily results in boolean values. They always produce a value of one of the two operands (or the value of one of the two operand expressions).

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

In JavaScript we tipically use these behaviors for null checking and to provide fallback values for variables. Altough, because there are more falsy values, than just the null, this is a bit different, than let's say the "null coalescing operator" of C#. Let's see an example:

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

The first two points are generally saying, that if the values to be compared are of the same type, so there is no need to coerce the values, then they are simply compared via identity. So, 42 only equals to 42 and "abc" to "abc". Just like you would expect (from "===").

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

Okay, first let's see, what the hell is `ToNumber`? You will see other examples like this further on, so go through this in advance. `ToNumber` is a so called abstract function, which is a fancy phrase for an "internal only function". JavaScript use them internally, for example to convert a non-numeric value to a number. Whenever I mention a new abstract function, I will also introduce it. So let's see the `ToNumber` first.

The ToNumber function will work on strings just as you would expect. It will convert the string to a number as if you'd just gave it as a number. There are, however, obvious differences, like octal, `0-` prefixed numbers. If you coerce a string containing such a number, it will be treated like a basic decimal, and not like an octal number. If the string is containing an invalid decimal, so we couldn't convert it to a number, it will be `NaN`. However, if a string is empty `""` or it only contains whitespaces, like: `" ", "\n", etc.` the result will be `0`. We will dig into this later on.

If you coerce an object to number, then first, the object will be coerced to a primitive value, and then if it isn't already a number type, it will be coerced to number value. More on this "coercing an object to a primitive value" later. As for the booleans, the boolean `true` is coerced to `1` and `false` is coerced to `0`.

Okay, now go back to the comparison algorithm. If one of the values are string and the other is number, then the string will be coerced to number, then regular comparison will be done.

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

So, **if one of the values are booleans, then it will be coerced to a number**. Let's go through the example above:

The type of y is boolean, so it will be coerced to a number. Since it is true, it will become 1. However, the types of the values are still different, but this time we are comparing a number to a string. Thus, the string will be coerced to the number 42. Since 1 is obviously not equals to 42 the result will be false.

As you could guess it, the result of the second comparison will still be false, because the false will be coerced to the number 0. This means then that "42" is neither == false nor == true. But how can a value be neither truthy nor falsy?

Your brain is playing a game with you right now. If you return to the ES5 specs again you will realize, that there is no boolean coercion here at all. Instead, the boolean value will be coerced to a number.

This is why I would suggest to always avoid using `x == false` or `x == true` comparisons or if you know that one of the types will be boolean, while the other **might** be of an other type. In practice this will almost always introduce some bugs or head scratching later on.

In practice, I would assume you want to use these expressions to check for a values truthiness. (Altough, If I were you, I would seriously raise an eyebrow at myself while writing these expressions. Usually, your guts will just say that this isn't looking good. Even if you're sure that the type of x will be boolean.) In this case try these ones:

```js
// This will implicitly coerce the x to boolean
if(x) {
    console.log(x);     // x here can be anything that is not falsy, see the list at the start of this article
}

// Here you explicitly coerce the x to boolean, with the '!' operator
if (!!x) {
    console.log(x);     // x here can be anything that is not falsy, see the list at the start of this article
}
```

If I were to review your code, I would seriously recommend to use the latter one, as it is more readable.

**Comparing null to undefined**
This will be the easy part, to be honest. Also, here you can notice a good example when it is reasonable to use "==" over "===". First, check out the ES5 spec about this.

> 2. If x is null and y is undefined, return true.
> 3. If x is undefined and y is null, return true.

So, null and undefined when you compare them with "==" loose equality are equal to each other. Also, they would never be equal to anything else. So if you're using "==", then null and undefined is indistinguishable. (Of course, only in this case).

So you can use "==" to effectively check for null or undefined like:

```js
function isNullOrUndefined(a) {
    return a == null;   // or a == undefined
}
```

This is much shorter, and maybe a bit more readable, than a === null || a === undefined.

**Note**: However, oftentimes I would suggest to use the longer and more explicit format. See my reasons in the conclusion of this article.

**Comparing object to non-object**
Head to the ES5 specs again on this one.

> 8. If Type(x) is either String or Number and Type(y) is Object, return the result of the comparison x == ToPrimitive(y).
> 9. If Type(x) is Object and Type(y) is either String or Number, return the result of the comparison ToPrimitive(x) == y.

What does this `ToPrimitive(x)` do? This is the abstract operation, that is used inside JavaScript to convert a non primitive value (object, function, array) to a primitive value, as you may guessed it. How it is working is as follows: First, it will check if it has a valueOf method. If it does and returns a primitive value, then that value will be used. If not, but there is a toString method available, then that value will be used. If neither can provide a primitive value, then a `TypeError` will be thrown.

So, if one of the values is an object, function or an array, then that value will be coerced to its primitive value, after that we continue to compare those two values using the above rules.

```js
var x = [42];
var y = 42;

x == y;     // true
```

In this example, x will be coerced to its primitive. In case of arrays, since its valueOf method will just return the array itself, the toString will be used. Which will give us the elements inside the array, joined by ','. So, in this case it will become `"42" == 42`. Which we already described above, when we compared a string to a number.

## When you can fall off the edge (cases)
A lot of confusion, and debate on using the "==" is coming from edge cases, when you get "false positive" results from an expression.

Let's go through these cases:

```js
"0" == false;   // true
false == 0;     // true
false == "";    // true
false == [];    // true
"" == 0;        // true
"" == [];       // true
0 == [];        // true
```

This is 7 edge cases, where a lot of confusion is coming from. Altough, if you know the rules of the coercing, these are pretty straight forward. However, that isn't mean they are reasonable. So, you should just avoid these comparisons in general, if you can. As I already mentioned, x == false, comparisons should always be avoided. Then, we only have 3 more to discuss.

First, let's see the `"" == []"`, as we saw before, if one of the values are non-primitive, it will be coerced to its primitive. In case of an array it will use its `toString` method. On an `[]` empty array, this will leave us with an empty string `""`. Surely, `"" == ""` is true, so we're done here already. Also, it is quite reasonable if you know how it is working, right?

Now, check the `"" == 0` and `0 == []`. I talk about them together, because if you start the algorithm on the `0 == []` then you realize, that essentially it will become `0 == ""`, so they will become the same comparisons. Here, if we continue along with the comparison, we need to coerce the "" to a number, which coercion will result in the number `0`. No matter, how much you don't like this result.

The important part here, that this isn't because of **implicit** coercion at all. The reason behind this is that every string, that is empty or containing only whitespaces will become 0. Honestly, there isn't really any other value here to use, instead of 0. Maybe the NaN, though I doubt that will solve anything on the long run.

If you check this simple function, maybe you will see some reason behind this:

```js
function sum(a, b) {
    return (+a) + (+b);
}

sum(5, "");     // 5
```

I intentionally made the coercion to a number explicit here, with the `+`, to show that in this case it doesn't matter if you coerce this implicitly or explicitly and that the root of the confusion is not the coercion itself. Obviously, the coercion to a number would still happen without them.

In the method above, we just sum up the two number. So, actually it comes quite handy that empty or whitespaces-only strings becomes 0 and not NaN. In this case if the empty string would become NaN we would get `NaN`, of course. I doubt, that would help us at all, really.

## Conclusion, summary
First of all, I know we haven't checked out the ">", "<" comparisons, but I don't really want to make this article even bigger. So, we will look at them later on, in an other article.

As I said, earlier, while it is much shorter to check for `undefined` or `null` with "==" loose equality, in like 99 of 100 cases, I would suggest the more explicit, but also more longer "===" strict equality to do so and here's why. In practice, the experience levels of a team's members are really varied. As I experienced between different teams, usually it is much more readable for the team in its entirety if these kind of things are more explicit. It is because, while it is entirely usual for every web developer to know, that `undefined` and `null` are not exchangeable, I rarely met any junior dev, for example, who was aware of the fact, that they are, in fact, indistinguishable, but only, when used in a loose equality comparison. So, if a junior dev would look at this line of code:

```js
function isNullOrUndefined(a) {
    return a == null;   // or a == undefined
}
```
then three things can happen:

 - He/She will be confused, because he/she was sure that null is not equals to undefined, and will ask one of the seniors about this. <br> Which is one of the best choice the developer could make, because then you could tech these cool devs something new, and with this you can transfer your knowledge, which is, in the end, one of the most important part of your job in a senior role.

 - He/She will be confused, because he/she was sure that null is not equals to undefined. (Notice that this part is always the same) However, the junior just thinks, that "Okay, then. I was surely wrong about this one." So from now on, you have a developer, who is almost entirely sure, that 'undefined' and 'null' are the same. Which is not cool at all.

  -  He/She will be confused, because he/she was sure that null is not equals to undefined. (Notice that this part is always the same) So, now your teammate  will start to question his knowledge about this matter, and will do some research about this on his/her own. This is the other good scenario, since after that small or big reasearch about this topic, you will have a developer in your team which is also know about this.

Ultimately, I'm more of a "better be explicit" guy, just to avoid confusion and misunderstandings. Altough, this choice should never come down to one person's opinion. These kind of rules, like: `avoid using loose equality` should be done with the team together. There is no silver bullet here, or anywhere really, you can not state that it will be always better to avoid something, because there are always some edge cases. You couldn't just toss aside one feature of an "anything", just because it *can* be confusing. You will find use cases where that method most certainly will be more readable and much more easier to reason about, but remember to make it reasonable to everyone who works on the project. Leave a comment or better, tell your colleagues, that you used that particular method there because, reasons... If it makes sense to everyone on the project, then it will be just fine.

Also, if you're one of the Junior devs, who just started to have fun with programming, dare to ask questions if you are not sure about something. The best way to improve yourself is to **ask questions** from the seniors. I'm not saying here to always hang on the nerves of your senior colleagues, but don't be afraid to ask something, just because you think this will make you less capable in their eyes. The questions, that are sound the most stupid, are questions which you can learn a loat from. Most of the senior devs, I know love to talk about these kind of topics, they will happily help you, either by discussing the whole topic with you or just telling you the basic key words, which you can use to find good information about these topics.
