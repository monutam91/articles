import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeMapComponent } from './merge-map.component';
import { map, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';

fdescribe('MergeMapComponent', () => {
  let component: MergeMapComponent;
  let fixture: ComponentFixture<MergeMapComponent>;
  let testScheduler: TestScheduler;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MergeMapComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    fixture = TestBed.createComponent(MergeMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it(`should emit all of the values of the inner observable,
    regardless of the source's pace.`, () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const source = cold('-a--b----c----|', { a: 1, b: 3, c: 5 });
      const inner = cold('  a-b-c|', { a: 10, b: 10, c: 10 });
      const expected = '   -a-abab-bc-c-c|';

      const merged = source.pipe(
        mergeMap((value) => inner.pipe(map((innerValue) => value * innerValue)))
      );

      expectObservable(merged).toBe(expected, { a: 10, b: 30, c: 50 });
    });
  });

  it(`should not wait for any of the inner observables to complete,
  before starting a new one, nor cancel them`, () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const source = cold('-a--b----c----|', { a: 1, b: 3, c: 5 });
      const slow = cold('   -----------a|', { a: 10 });
      const fast = cold('      -a|', { a: 10 });
      const expected = '   -----b----c-a-|';

      const merged = source.pipe(
        mergeMap((value) => {
          if (value === 1) {
            return slow.pipe(map((innerValue) => innerValue * value));
          } else {
            return fast.pipe(map((innerValue) => innerValue * value));
          }
        })
      );

      expectObservable(merged).toBe(expected, { a: 10, b: 30, c: 50 });
    });
  });

  it(`should never complete, if one of the inner observables are not completing`, () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const source = cold('      -a--b----c----|', { a: 1, b: 3, c: 5 });
      const nonCompleting = cold('-a', { a: 10 });
      const inner = cold('           -a|', { a: 10 });
      const expected = '         --a--b----c----';

      const merged = source.pipe(
        mergeMap((value) => {
          if (value === 1) {
            return nonCompleting.pipe(map((innerValue) => value * innerValue));
          } else {
            return inner.pipe(map((innerValue) => value * innerValue));
          }
        })
      );

      expectObservable(merged).toBe(expected, { a: 10, b: 30, c: 50 });
    });
  });

  it(`should process every source value, when a new value arrives
    on the inner hot observable`, () => {
    testScheduler.run((helpers) => {
      const { cold, hot, expectObservable } = helpers;
      const source = cold('-a--b----c----|', { a: 1, b: 3, c: 5 });
      const inner = hot('  a--a---a-------', { a: 10 });
      const expected = '   ---a---(ab)-';

      const merged = source.pipe(
        mergeMap((value) => inner.pipe(map((innerValue) => value * innerValue)))
      );

      expectObservable(merged).toBe(expected, { a: 10, b: 30 });
    });
  });
});
