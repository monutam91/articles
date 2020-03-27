# How to RxJS - Hot vs Cold

Careful hot stuff ahead! What are the Hot and Cold Observables in Rx?

In the previous part of this series of articles, I wrote about the basics of RxJS and how the Observables are working, what concepts are they built upon. In this part, I'd like to talk about a fundamental concept of RxJS, which is however the most commonly misunderstood part of this technology.

<div align="center">
    <img src="./assets/thumbnail.jpg" />
    <p>
    Photo by <a href="https://unsplash.com/@ferdinand_feng?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">ferdinand feng</a> from <a href="https://unsplash.com/s/photos/ice-lava?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
    </p>
</div>

## Observables are lazy - or aren't they?

As I said in the previous article Observables are lazy, so they will only ever do something when somebody subscribes to them when somebody is interested. If we're going forward on this, then that means, that you cannot miss any item emitted by an Observable, since they will only emit something if you subscribe to it. However, this is not true in every case. Check out the following example:

```ts
const subject = new Subject<number>();
subject.next(1);

// Here the console.log will never run since we missed the next on the subject
const subscription = subject.subscribe(val => console.log(val));
```

As you can see, we will miss the first next event on the subject. What's the matter then, with this whole lazy thing of the Observable.

## The producer

<div align="center">
    <img src="./assets/producer.jpg" />
    <p>
    Photo by <a href="https://unsplash.com/@christopher__burns?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Christopher Burns</a> from <a href="https://unsplash.com/s/photos/factory?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
    </p>
</div>

As we already know, an Observable is an asynchronous data stream. We can listen to this data stream for data, but something needs to _produce_ these items. This something is called the **producer** of the Observable. For example in the case of the 'of' creational operator it is the parameter given to it or in case of the 'from' operator it can be the promise which we passed to it.

To simplify this even more, Observables are functions, their job is to tie an observer to a producer. If we're moving on with this, we can also realize, that since an Observable is just a function, with one job, they don't necessarily set up the producer. Their only task is to notify the observer whenever the producer makes some new data.

We can divide the Observables into two categories by their producer. An Observable can either be _Hot_ or _Cold_.

<div align="center">
    <img src="./assets/cold-observable-splash.jpg" />
    <p>
    Photo by <a href="https://unsplash.com/@v2osk?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">v2osk</a> from <a href="https://unsplash.com/s/photos/ice-cold?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
    </p>
</div>

> We call an Observable Cold if the producer of it is created or activated during subscription.

Let's check out a basic example by creating an Observable with its constructor.

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

The above code will print a sequence of numbers one by one every second. The important part here is the function which we're giving to Observable's constructor. This parameter is called 'subscriber' inside Rx's type definition. Whenever somebody subscribes to an Observable this method will be called and this method is responsible for tying the producer to the observer. In the above example, we're creating the interval in this function, so we're creating and activating the producer of our Observable during subscription. Since this interval hasn't existed before we subscribed to this Observable, we can be sure that we aren't missing any data emitted by the Observable. To put it simply, we're lazily creating our producer.

> We call an Observable Hot if the producer of it is created or activated outside of its subscription.

Now, let's see an example of a hot Observable.

```ts
const ws = new WebSocket("ws://my-awesome-websocket");

const hot$ = new Observable(observer => {
  ws.addEventListener("message", e => observer.next(e));
});

// ...

// Here we may already miss out on some next notifications
hot$.subscribe(msg => console.log(msg));
```

Here, the producer is the WebSocket, but the twist here is that we aren't creating this WebSocket, the producer, during subscription. Instead, we're using a reference of the producer, so the producer already exists it may even emitted messages already. In the case of this WebSocket example, it is even better like this, since you don't want to create a new WebSocket connection every time someone is subscribing to your Observable. In this case, when you subscribe to the Observable, you may already miss some 'next' notifications.

However, one flaw of the above example is that we don't have any TearDown logic to close our WebSocket connection. In a real-world application, you would create a Cold Observable for your WebSocket connection and make this cold observable hot and make others subscribe to this hot Observable. RxJS provides several operators to make a Cold Observable Hot, but we're going to cover them later in this series.

## Summary

To sum things up, the topic we just covered is one of the most important cornerstone of RxJS, yet the most commonly misunderstood one by newbie programmers. The lack of understanding of this topic was crucial in most of the cases where I or one of my fellow programmers struggled with.

## Notes and questions

One of my fellow programmer friend pointed out on my first article, that it was a bit long to read. So, here I tried to make things a bit shorter to make it easier to grasp. Please, leave some feedback if you can, is this better this way? Or should I just return to the longer, but more whole topics?

Also, please feel free to leave any suggestions or comments regarding my story. I am also open to new things to improve or learn.
