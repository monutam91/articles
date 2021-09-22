# How we used ng-mocks to improve the quality of thousands of tests

Recently, we made a decision to migrate all of our tests from karma to jest. We are working inside an NX repo and since NX moved to Jest as a default we wanted to align with them as well. Migrating our karma tests were an other challange and a very difficult one. I plan to write an article about it later.

During the jest migration step, we also made a decision, that we should move away from using **NO_ERROR_SCHEMA** or **CUSTOM_ELEMENTS_SCHEMA** in our unit tests. This means, that you always have to mock the child components which without any help, could be quite tedious. Since, you always have to create the different classes and after that you also have to maintain them. To help out this process we introduced, the [ng-mocks](https://ng-mocks.sudo.eu/) library.

## What is ng-mocks

> ng-mocks is a testing library which helps with mocking services, components, directives, pipes and modules in tests for Angular applications. When we have a noisy child component, or any other annoying dependency, ng-mocks has tools to turn these declarations into their mocks, keeping interfaces as they are, but suppressing their implementation.

## Mocking providers

To mock providers you usually end up doing something like this:

```ts
TestBed.configureTestingModule({
  // ...
  providers: [
    {
      provide: NavigationFacade,
      useValue: { editPlan: jest.fn(), createPlan: jest.fn() },
    },
  ],
});
```

This is a lot of boilerplate for something quite simple. Instead of this, with ng-mocks and our auto spy setup you can just call the [_MockProvider_](https://ng-mocks.sudo.eu/api/MockProvider) or the _MockProviders_ method from ng-mocks.

```ts
TestBed.configureTestingModule({
  // ..
  providers: [
    MockProvider(DatePipe, { transform: jest.fn((value) => value as any) }),
    ...MockProviders(SpinnerService, NavigationFacade),
  ],
});
```

This will mock the SpinnerService and NavigationFacade services. If you want to override some of the methods or attributes of a service, then you can use the MockProvider method. You can see an example to that above with the DatePipe. One good practice, I follow with ng-mocks is that, I provide everything I can with ng-mocks. Whenever, I have to use something else in the providers array, I have that at the start of the providers array, then I specify the MockProvider methods with their customized spys or attributes, then at the end of the providers array, I use the MockProviders method to mock everything else.

```ts
TestBed.configureTestingModule({
  // ..
  providers: [
    provideMockStore({
      // ...
    }),
    MockProvider(ConfirmPopupService, {
      openDialog: jest.fn().mockReturnValue(of({})),
    }),
    MockProvider(DatePipe, { transform: jest.fn((value) => value as any) }),
    ...MockProviders(SpinnerService, CurrencyPipe),
  ],
});
```

So in short, mock providers in this order:

- Specific mock providers
- MockStore/Mock Selectors
- Custom MockProvider calls
- All regular providers with MockProviders

In this order, it is easy to find a provider if you ever need to change one.

## Mocking components

**DO NOT USE CUSTOM_ELEMENTS_SCHEMA or NO_ERROR_SCHEMA!** Using those, you basically tell Angular, that if it sees an unknown tag, then just skip it. This hurts in the long run a lot. We were not using strict mode in our project. You can mask non-existent Inputs with this and it can cause false positive tests as well. Always mock out the child components you use, to make sure that you are using its API in a correct way. To make this process much more easier you can use the [_MockComponent_](https://ng-mocks.sudo.eu/api/MockComponent) and _MockComponents_ methods from ng-mocks.

```ts
TestBed.configureTestingModule({
  imports: [TestingModule],
  declarations: [
    ViewComponent,
    ...MockComponents(PageContentComponent, HeaderComponent, OverviewComponent),
  ],
});
```

The _MockComponent(s)_ will create a component type which uses the same selector as the class passed to it, and also the same API, the same Inputs and Outputs, but all of the methods inside them will be dummies.

## Mocking pipes, directives

Mocking pipes or directives works almost the same as mocking providers and components. You can use the [_MockPipe(s)_](https://ng-mocks.sudo.eu/api/MockPipe) and the [_MockDirective(s)_](https://ng-mocks.sudo.eu/api/MockDirective) methods for it. Using the _MockPipe_ function, you can override the pipes transform method as well, just as you could override the methods of services.

## Mock an entire module

You can mock an entire module as well. There is a method called [_MockModule_](https://ng-mocks.sudo.eu/api/MockModule) in ng-mocks to do so. Again, the mock module will have the identical interface as its source, but all its methods will be dummies. Also, the declaraiotns, providers, imports and exports will be mocked.

## Overriding a mock instance

You may have noticed, that we covered how can you override the methods of a MockProvider and a MockPipe, but we haven't talked about how you can change the dummy methods of MockComponents or MockDirectives. You can use the [_MockInstance_](https://ng-mocks.sudo.eu/api/MockInstance) method for this. With this method you can customize the declarations and providers in tests, **before the given instance have been created**. For instance you can customize individual methods or attributes, like this:

```ts
  beforeEach(
    waitForAsync(() => {
      TestBed..configureTestingModule({
        declarations: [
          EditorComponent,
          ...MockComponents(SearchComponent, InputComponent)
        ],
        // ...
      })
      .compileComponents();
    }),
  );

  beforeEach(() => {
    MockInstance(SearchComponent, 'selectInput', {reset: jest.fn()} as any);
    MockInstance(InputComponent, 'valueGroup', {reset: jest.fn()} as any);

    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });
```

In the above example, we override the mocked values of the SearchComponent's selectInput attribute and InputComponent's valueGroup attribute. An important thing to take away from this section and this example is that these overrides had to be done before the instance itself is created. That is why, in classic test suites, where we use TestBed instead of ng-mock's MockBuilder, we have to do this in a beforeEach which is running before the component instance is created or in the same beforeEach where it is created, but before we call createComponent. So, inside classical test suites, you couldn't override mocked instances in every _it_ statement.

Once possible solution to this is to group tests that are using the same mock customizations. Alternatively, you can create a method where actually call the createComponent, but then you have to call that method in every _it_ statement.

## Auto spying

ng-mocks can be set up to [auto spy](https://ng-mocks.sudo.eu/extra/auto-spy) every method inside the mocked classes, like Components,Services/etc. We set this up in _test-setup.ts_ file. Like this:

```ts
ngMocks.autoSpy("jest");
```

With this setup, ng-mocks will create a _jest.Mock_ on every method, so if you just want to spy on a method, you don't have to override anything on a mock instance. It is useful when you only need a general mock, where you just want to check if a method has been called for example. Even if you want it to return a specific value, you can do that:

```ts
it("should do something", () => {
  (someMockService.someMethod as jest.Mock).mockReturnValue("mock value");

  // ...
});
```

With this you can override the return value of a method.

## Final thoughts

Since we are started to use the ng-mocks during the jest migration we mostly used it inside classical test suite. Where we use TestBed to configure the testing module and create the component/directive/service/etc. That is why I only talked about Mock* methods. It would have been too much of a work to migrate all of our test suites to use ng-mocks' _MockBuilder_ and _MockRender_. However, they have there own adventages, it is much simpler to use those methods, you'll need less boilerplate to set up a test environment. As we're moving forward with the use of ng-mocks we will start to use that as well, when I have enough experience to write a summary about them, I'm going to get back to this topic.
