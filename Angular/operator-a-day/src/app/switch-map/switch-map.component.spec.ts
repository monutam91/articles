import { ComponentFixture, TestBed } from '@angular/core/testing';
import { map, switchMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';

import { SwitchMapComponent } from './switch-map.component';

fdescribe('SwitchMapComponent', () => {
  let component: SwitchMapComponent;
  let fixture: ComponentFixture<SwitchMapComponent>;
  let testScheduler: TestScheduler;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SwitchMapComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    fixture = TestBed.createComponent(SwitchMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it(`should emit values from the inner observable until a new value arrives on the source,
      then it should switch to the new inner observable`, () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const source = cold('-a---b----c----|', { a: 1, b: 3, c: 5 });
      const inner = cold('a-b-c|', { a: 10, b: 10, c: 10 });
      const expected = '-a-a-b-b-bc-c-c|';

      const switched = source.pipe(
        switchMap((value) =>
          inner.pipe(map((innerValue) => value * innerValue))
        )
      );

      expectObservable(switched).toBe(expected, { a: 10, b: 30, c: 50 });
    });
  });

  it(`should not emit any values if the source values are coming faster,
      then the inner observable starts to emit,
      until the source settles down`, () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const source = cold('-a-b-c|', { a: 1, b: 3, c: 5 });
      const inner = cold('--a-b-c|', { a: 10, b: 10, c: 10 });
      const expected = '-------a-a-a|';

      const switched = source.pipe(
        switchMap((value) =>
          inner.pipe(map((innerValue) => value * innerValue))
        )
      );

      expectObservable(switched).toBe(expected, { a: 50 });
    });
  });

  it(`should never never complete if the source isn't completing`, () => {
    testScheduler.run((helpers) => {
      const { cold, hot, expectObservable } = helpers;
      const source = hot('-a-b-c---------', { a: 1, b: 3, c: 5 });
      const inner = cold('a-b-c|', { a: 10, b: 10, c: 10 });
      const expected = '-x-y-z-z-z-----';

      const switched = source.pipe(
        switchMap((value) =>
          inner.pipe(map((innerValue) => value * innerValue))
        )
      );

      expectObservable(switched).toBe(expected, { x: 10, y: 30, z: 50 });
    });
  });

  it(`should emit the further values of the inner observable,
      if that is a hot observable, and should not complete,
      if that inner observable nover completes`, () => {
    testScheduler.run((helpers) => {
      const { cold, hot, expectObservable } = helpers;
      const source = cold('-a---b----c----|', { a: 1, b: 3, c: 5 });
      const expected =    '--x-x';
      const inner = hot(  'a-a-a-----', { a: 10 });

      const switched = source.pipe(
        switchMap((value) =>
          inner.pipe(map((innerValue) => value * innerValue))
        )
      );

      expectObservable(switched).toBe(expected, { x: 10 });
    });
  });
});
