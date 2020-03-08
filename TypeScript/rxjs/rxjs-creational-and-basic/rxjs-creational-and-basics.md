# RxJS Observable creation, like a pro

In the previous part of this series of articles, I wrote about the basics of RxJS and how the Observables are working, what concepts are they built upon. In this article, we will go through the commonly used creational operators.

I am going to show the marble diagram of some of these operators, then I'll give an example to usage.

## The 'from' operator

The first operator, which is widely used is the `from`. Let's refer to the description of this operator from the RxJS docs:

> Converts almost anything to an Observable.

To be honest, it is this simple. This operator can create an Observable from an Array, array-like object, an iterable object, a Promise or an Observable-like object.

However, it is worth to mention, that in the case of Array, array-like and iterable objects, **it will emit the items inside that object, one by one**. See the marble diagram at the docs.

<div align="center">
    <img src="./assets/from-marble.png" width="500px" style="padding: 5px; background: white;" />
    <p>Image from <a href="https://rxjs-dev.firebaseapp.com/api/index/function/from">RxJS's documentation</a>
    </p>
</div>

### Example

Inside an Angular application, the most common usage of this operator is to create an Observable from a Promise. There are several libraries out there, inside npm which are relying on Promises, since a Promise is a part of the ES2015 specs, while the Observables are not. However, an Angular application heavily relies on Observables, you can live without them, but that would be like coding with one hand tied.

```ts
@Injectable()
export class SomeServiceUsingALibrary {
  public callingAnAsyncLibraryMethod(): Observable<ReturnType> {
    return from(library.AsyncMethod());
  }

  public callingANonTypedLibraryAsyncMethod(): Observable<
    DocumentedReturnType
  > {
    return from<ObservableInput<DocumentedReturnType>>(
      nonTypedLib.asyncMethod()
    );
  }
}
```

I wrote two examples, the first one is the simpler case, where you have a library, which has type definitions. In the second example, you can see how to tell the `from` operator what is the type of the Promise, returned by the library. You can just return an `any` type of course, but you should avoid using any in almost every case.

## The 'of' operator

This is a simple creational operator, very similar to from. Let's see the description again.

> Each argument becomes a next notification.

<div align="center">
    <img src="./assets/of-marble.png" width="500px" style="padding: 5px; background: white;" />
    <p>Image from <a href="https://rxjs-dev.firebaseapp.com/api/index/function/of">RxJS's documentation</a>
    </p>
</div>

It is this simple. Every argument you give to this operator will become a next notification. The basic difference from the 'from' operator is that the 'of' will not flatten any of its arguments. If you give it an array as an input, then it will emit the array itself, and not the elements inside the array.

### Example

Inside an Angular application and any application, this operator is used for example to create default Observable values or fallback Observable values. You can use it inside a simple error handler, for example, to return a fallback Observable, containing a default or fallback value, so other piped operators won't fail.

## The 'fromEvent' and 'fromEventPattern' operators

The next two operators on our list will be `fromEvent` and `fromEventPattern` operators. I talk about these together since they are used for the same thing, and the _fromEvent_ can be seen as a shorthand for the _fromEventPattern_ operator.

Without further ado, let's see the descriptions of these operators.

#### fromEvent

> Creates an Observable from DOM events, or Node.js EventEmitter events or others.

#### fromEventPattern

> When that method for adding event handler was something _fromEvent_ was not prepared for.

So as the name implies, these operators are creating an Observable stream from a series of events happening on a target object.

The `fromEvent` can listen to the following event targets:

- DOM EventTarget
  - This is an object with _addEventListener_ and _removeEventListener_ methods. The optional third parameter for these methods can be given as the third parameter of the _fromEvent_ as well
- Node.js EventEmitter
  - This is Node's Event target object, basically. It is an object with addListener and removeListener methods.
- JQuery-style event target
  - An object with on and off methods
- DOM NodeList or DOM HtmlCollection
  - In this case, although these are not EventTargets directly, RxJS handles them, via iterating over all of its elements and subscribing to the given event on every one of them.

As you can see from the description of the _fromEventPattern_ you can use it if you run into an event target object that could not be handled by the _fromEvent_ operators. It has to important parameters, the _addHandler_ and the _removeHandler_ functions. In these you should add the _eventHandler_ to the _eventTarget_ and remove it. If you get some kind of token, when adding a handle, you can return it in the _addHandler_ function, this return value will be given to the _removeHandler_ as the second parameter.

### Example

Inside Angular applications, these operators I rarely used, since you would rather listen to events on elements via Event binding. Although, there can be useful implications of these operators when creating a low-level, custom component or directive. I used it, inside a component that handled drag and drop events.

## The 'EMPTY' constant

This is not a creational operator, but it was before it became deprecated. Although, it is not an operator now it is worth mentioning since there are some basic use cases for this constant.

> Just emits 'complete', and nothing else.

Just as the description says and its name implies, this is an empty Observable, which will complete immediately upon subscription.

### Example

The empty constant is typically used as a fallback when you have to return a default Observable based on an expression.

Inside an Angular application, this can be used to wrap a conditional side effect inside one Observable. Let's assume you're writing an online store for used goods and you have a feature where if someone is buying an item, you need to inform the seller about this, if he/she configured the ad to do so.

```ts
@Injectable()
export class BuyerService {
  public buy(id: string): Observable<void> {
    return this.http.get<void>(`/api/ad/${id}`).pipe(
      switchMap(result => {
        if (result.ok && result.notificationNeeded) {
          return this.http.get<void>(`/api/ad/${id}/notify-seller`);
        }
        return EMPTY;
      })
    );
  }
}
```

In the above example, if anyone is calling the BuyerService's buy method, this notification side effect will be handled, and the caller doesn't have to know about it at all. When the whole process is done, there will be a next and right after that a complete notification on the Observable. It doesn't matter if we had to notify the seller or not.

## The 'defer' operator

The last operator which I want to mention in this article is the `defer`. Let's check out the docs again.

> Creates the Observable lazily, that is, only when it is subscribed.

### Hot stuff!!

<div align="center">
    <img src="./assets/hot-stuff-stock.jpg" />
    <p>
        Image by <a href="https://pixabay.com/photos/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=691939">Free-Photos</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=691939">Pixabay</a>
    </p>
</div>

Okay, so what does this mean, and when we should use it. As I said in the previous article Observables are lazy, so they will only ever do something when somebody subscribes to them when somebody is interested. If we're going forward on this, then that means, that you cannot miss any item emitted by an Observable, since they will only emit something if you subscribe to it. However, this is not true in every case. Check out the following example:

```ts
const subject = new Subject<number>();
subject.next(1);

// Here the console.log will never run since we missed the next on the subject
const subscription = subject.subscribe(val => console.log(val));
```

As you can see, we will miss the first next event on the subject. What's the matter then, with this whole lazy thing of the Observable. As we already know, an Observable is an asynchronous data stream. We can listen to this data stream for data, but something needs to _produce_ these items. This something is called the **producer** of the Observable. For example in the case of the 'of' creational operator it is the parameter given to it or in case of the 'from' operator it can be the promise which we passed to it.

To simplify this even more, Observables are functions, their job is to tie an observer to a producer. If we're moving forward with this, we can also realize, that since an Observable is just a function, with one job, they don't necessarily set up the producer. Their only task is to notify the observer whenever the producer makes some new data.

We can divide the Observables into two categories by their producer. It can be a _Hot_ or a _Cold_ Observable.

**We call an Observable Cold if the producer of it is created or activated during subscription. Let's check out a basic example by creating an Observable with its constructor.**

```ts
const timer$ = new Observable(observer => {
  let index = 0;
  const intervalToken = setInterval(() => observer.next(index++), 1000);

  return () => clearInterval(intervalToken);
});

timer$.subscribe(value => console.log(value));
// 1
// 2
// 3
// ...
```

The above code will print a sequence of numbers one by one every second. The important part here is the function which we're giving to Observable's constructor. This parameter is called 'subscribe' inside Rx's type definition. Whenever somebody subscribes to an Observable this method will be called and this method is responsible for tying the producer to the observer. In the above example, we're creating the interval in this function, so we're creating and activating the producer of our Observable during subscription. Since this interval hasn't existed before we subscribed to this Observable, we can be sure that we aren't missing any data emitted by the Observable. To put it simply, we're lazily creating our producer.

Now, let's see an example of a hot Observable.

```ts
const ws = new WebSocket("ws://my-awesome-websocket");

const hot$ = new Observable(observer => {
  ws.addEventListener("message", e => observer.next(e));
});
```

Here, the producer is the WebSocket, but the twist here is that we aren't creating this WebSocket, the producer, during subscription. Instead, we're using a reference of the producer, so the producer already exists it may even emitted messages already. In the case of this WebSocket example, it is even better like this, since you don't want to create a new WebSocket connection every time someone is subscribing to your Observable. However, in this case, when you subscribe to the Observable, you may already miss some 'next' notifications.

However, one flaw of the above example is that we don't have any TearDown logic to close our WebSocket connection. In a real-world application, you would create a Cold Observable for your WebSocket connection and make this cold observable hot and make others subscribe to this hot Observable. RxJS provides several operators to make a Cold Observable Hot, but we're going to cover them later in this series.

### Back to the 'defer' operator

After our "little" detour with Hot and Cold Observables, let's get back to the 'defer' operator. As the description said, we can use this operator to create an Observable lazily. It can be useful for example when you're working with Promises. Since as we said in the previous article, the Promises are not lazy. Whenever you create a Promise it will run, even if there aren't any then calls on it. 'defer' operation to the rescue:

```ts
@Injectable()
export class SomeService {
  public callPromise() {
    return from(someLibrary.callPromise());
  }

  public lazilyCallPromise() {
    return defer(() => from(someLibrary.callPromise()));
  }
}
```

In the example above, you're calling the 'callPromise' method, then the Promise inside the 'from' will always be created, thus will always run. In the 'lazilyCallPromise' method however, the Promise and the Observable will only be created if you subscribe to the output Observable of defer.

It is the same as if we would have created the promise as the producer while subscribing:

```ts
new Observable(observer => {
  someLibrary.callPromise().then(result => observer.next(result));
});
```

Thank you for everyone, who helped me to create this article! I am open to any constructive criticism and bug reports regarding my articles. Please, feel free to contact me! :)
