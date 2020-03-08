# RxJS Basics

This article is yet another tutorial like writing about Rx and mainly RxJS. I've written this article to help my colleagues learn the basics of Rx. I know there are several other writings, tutorials and writings already on this topic, but since I had to summarize them either way, I may also just make this a public article, and I might help some of the devs out there as well. Furthermore, I like to read Rx over and over, to deepen my knowledge as well.

## The foundations of Rx

The Reactive Extensions lies on several foundations, basic concepts which it is built upon. I like to highlight some of these before we dig deeper.

<div align="center">
    <img src="./assets/foundations-stock.jpg" />
    <p>
    Image by <a href="https://pixabay.com/users/PIX1861-468748/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=668100">Csaba Nagy</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=668100">Pixabay</a>
    </p>
</div>

### Observer pattern

The Observer pattern is a design pattern, which the Rx "simply" implements. Since this pattern is one of the main cornerstones of Rx, I'd like to talk about it a bit.

Fortunately, we can find a really good definition of the pattern on [Wikipedia](https://en.wikipedia.org/wiki/Observer_pattern).

> The observer pattern is a software design pattern in which an object, called the subject, maintains a list of its dependents, called observers, and notifies them automatically of any state changes, usually by calling one of their methods.

So basically we have things which we want to Observe. We want to be notified when some change is happening on that _thing_. Let's say we have a button, and we want to listen to its click events. The solution is simple, you would say, 'Just listen to the click event, and put a callback on it'. Of course, it is easy, but what if in our system we associate this click to some higher-level event? Take a login form, for example, you will have a submit button on that form, that will try to authenticate the user with the given information. Afterward, you will navigate the user to some other page, so that he/she can use your awesome application. Inside this application, however, we need to get a hold of our User object, which contains basic info about our user. You can see in this example, that a basic click event now, corresponds to a higher-level 'login event'. There will be several parts of your application that will be interested in this event, like guards in on your routes, or components which are showing user infos, or services that might want to send some userID or some token with every request the user makes to the server to authorize the user.

This would still be quite easy since you could just create a service, which can store the user object and can also give it to other interested components inside your application.

Let's go a bit further with this token part. A token usually will expire in time. Of course, usually, you have methods to get a new token, but let's put that aside for a minute. When this token becomes useless, you should notify your different parts of your application, that the user using this token is now not authenticated basically. So, you need to log out the user. This is where the Observer pattern comes handy. You can create a **Subject** which is a topic, those other components could be interested. This Subject will contain the currently active user object, on login you can simply **emit** the logged-in User object. Other parts of your application can and probably will **subscribe** to this Subject. These **Observers** will be notified when this change happens and they can act upon it however they see fit.

### Functional Programming

The other important part which I want to talk about is Function Programming. I don't want to dive deep into this topic since we could just produce a different series of articles for this topic. I just like to go through the basics and let the reader discover it deeper.

First, look at the definition of this paradigm, again we can check out Wikipedia.

> Functional programming is a programming paradigm — a style of building the structure and elements of computer programs — that treats computation as the evaluation of mathematical functions and avoids changing-state and mutable data. It is a declarative programming paradigm in that programming is done with expressions or declarations[1] instead of statements.

So basically we write our function as you may have seen mathematical functions in High school. For example: `f(g(x))` this expression states that we do 'g', then on the results of 'g' we run 'f'. So **we're stating what we do** instead of how we're going to do it. The imperative could be something like:

    - Take x, and calculate the square of its value
    - Given the square of x, negate it

So **we're stating how we are doing** the calculation.

<div align="center">
    <img src="./assets/pure-functions-stock.jpg" />
    <p>Photo by <strong><a href="https://www.pexels.com/@lastly?utm_content=attributionCopyText&amp;utm_medium=referral&amp;utm_source=pexels">Tyler Lastovich</a></strong> from <strong><a href="https://www.pexels.com/photo/underwater-photography-of-clear-water-590178/?utm_content=attributionCopyText&amp;utm_medium=referral&amp;utm_source=pexels">Pexels</a></strong>
    </p>
</div>

There are two cornerstones of this paradigm as the definition states. One of them is _avoid changing state_. We can achieve this with so-called _pure functions_. A pure function is a function, which isn't causing any side-effects and also only depends on the parameters given to it and no other global objects. To put it simply, a pure function will:

    - always return the same result if given the same arguments
    - will not cause any observable side effect, just by calling it

The other one is _avoid mutable data_, this is very simply just means that you cannot alter the state of an object after its creation. Instead, you need to create another object with the new values. We call these kinds of objects immutable.

Numerous other pieces of techniques are commonly used in Functional Programming, like higher-order functions, closures, etc. but as I said the aim of this article is not to cover these topics.

<div align="center">
    <img src="./assets/rxjs-logo.png" width="300px" />
</div>

## RxJS

Okay, now that we're done with the basics, let's continue. First, start with a quote from RxJS's Overview:

> RxJS is a library for composing asynchronous and event-based programs by using observable sequences. It provides one core type, the Observable, satellite types (Observer, Schedulers, Subjects) and operators inspired by Array#extras (map, filter, reduce, every, etc) to allow handling asynchronous events as collections.

So basically, in Rx you are programming with asynchronous data streams. You can imagine every user interaction as a stream of events. You can handle every item emitted by this stream, which in this case would be the events itself. If we're taking one step further, we can also notice, that even an application itself can be visualized as an asynchronous data stream. This data stream would emit the different application states. This is the main concept of Redux which can be another topic, again.

If we're looking at the definition above, we can illustrate the relation of Rx to Promises and Array handling with a simple matrix:

|       |  SINGLE  |   MULTIPLE |
| ----- | :------: | ---------: |
| SYNC  | Function | Enumerable |
| ASYNC | Promise  | Observable |

Let's go through the core concepts of RxJS. As the definition mentioned the fundamental of the whole library is the `Observable`. The Observable class is the type of an asynchronous data stream in Rx which can only be used to subscribe to the changes. Through this observable, the **subscriber** will be notified about new data, a new change and can act upon it. You can think of these Observables as read-only assembly lines, you can only _observe_ the new items, but you cannot push new items into this assembly line directly.

Usually, you don't interact with Observers directly, you will use a Subject instead, but since this is a core element of Rx and the Observable pattern you should know what exactly are they. The Observers allow you to push data to Observables, thus to notify subscribers about a change, a new item. If you create an Observable with the `new` keyword, you can check out how it is working.

```ts
const counter = new Observable(observer => {
  observer.next(1);
  observer.next(2);
  observer.next(3);

  setTimeout(() => {
    observer.next(4);
    observer.complete();
  }, 1000);
});
```

The next core type of Rx is the **Subject**. To put it simply, you can think of Subjects as both an Observable and an Observer. In fact, inside the RxJS source, you can also see that the Subject implements these two interfaces directly. So, you can think of the Subjects as Read-Write assembly lines, where you can put new items and also _observe_ the new items, changes.

Okay, at this point in the article, we can push new items inside subjects, and we can observe these with the Observables, through a _subscription_, but we cannot manipulate these before giving them to the subscribers. This is what the **operators** are for. The operators inside RxJS enable you to perform, you guessed it, operations on each item. Looking at the very basic operators, these are as simple as the native Array operators, like `map`, `filter`, `reduce`, etc. We will go through these at another time because the amount of time we could talk about them is almost endless.

## Marbles

<div align="center">
    <img src="./assets/marbles-stock.jpg" />
    <p>Image by <a href="https://pixabay.com/users/Couleur-1195798/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1659398">Couleur</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1659398">Pixabay</a>
    </p>
</div>

Since the main part as a developer who just started to learn Rx will be to read the docs about the operators, let's see how you can read the essential piece of RxJS documentation, the marbles.

> To explain how operators work, textual descriptions are often not enough. Many operators are related to time, they may for instance delay, sample, throttle, or debounce value emissions in different ways. Diagrams are often a better tool for that. Marble Diagrams are visual representations of how operators work and include the input Observable(s), the operator and its parameters, and the output Observable.

To explain the marble diagrams, let me just throw in the definition and the example of a marble diagram from RxJS's documentation.

<div align="center">
    <img src="./assets/marble-diagram-anatomy.svg" width="500px" style="background: white;" />
    <p>Image from <a href="https://rxjs-dev.firebaseapp.com/guide/operators">RxJS's documentation</a>
    </p>
</div>

Every operator works on one or a collection of Observables and results in an output Observable. On top of the diagram, you can see the input observable, the line represents the time from the start of the Observable till it's completed. The completion of an Observable is represented by a line diagonal to the timeline. The little circles (the marbles) are the individual items emitted by the Observable.

The box between the input and output Observables are representing the operator itself, with a text inside of it showing the nature of the transformation done by this operator.

An 'X' on the timeline marks an error emitted by the Observable. No more value will be delivered thereafter.

## Difference between OBservables and Promises

<div align="center">
    <img src="./assets/promise-stock.jpg" />
    <p>
        Image by <a href="https://pixabay.com/users/cherylholt-209609/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=329329">Cheryl Holt</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=329329">Pixabay</a>
    </p>
</div>

Since we said that both Promises and Observables are handling asynchronous tasks, you might be wondering what is the difference between them. So let's go through them quickly. I summarized them in a table, so you can easily grasp it.

|        Promise         |     Observable      |
| :--------------------: | :-----------------: |
|      Single Value      |   Multiple Value    |
|        Not lazy        |        Lazy         |
|     Not cancelable     |     Cancelable      |
| No completion callback | Completion callback |
