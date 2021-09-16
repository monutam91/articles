import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestScheduler } from 'rxjs/testing';
import { concatMap, map } from 'rxjs/operators';

import { ConcatMapComponent } from './concat-map.component';

describe('ConcatMapComponent', () => {
  let component: ConcatMapComponent;
  let fixture: ComponentFixture<ConcatMapComponent>;
  let testScheduler: TestScheduler;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConcatMapComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    fixture = TestBed.createComponent(ConcatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should process every value, wait for the inner Observable to finish before processing the next one', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const source = cold('-a---b-----c----|', { a: 1, b: 3, c: 5 });
      const inner =  cold('a-b-c-|', { a: 10, b: 10, c: 10 });
      const expected =    '-a-a-a-b-b-b-c-c-c-|';

      const concated = source.pipe(
        concatMap((value) =>
          inner.pipe(map((innerValue) => value * innerValue))
        )
      );

      expectObservable(concated).toBe(expected, {
        a: 10,
        b: 30,
        c: 50,
      });
    });
  });

  it(`should never emit any value if the inner observable doesn't emit anything nor completes`, () => {
    testScheduler.run((helpers) => {
      const { cold, hot, expectObservable } = helpers;
      const source = cold('-a---b-----c----|', { a: 1, b: 3, c: 5 });
      const inner =   hot('---');
      const expected =    '------------------------';

      const concated = source.pipe(
        concatMap((value) => inner.pipe(map(() => value * 10)))
      );

      expectObservable(concated).toBe(expected);
    });
  });

  it(`should never emit any value if the inner observable is hot and only emits values before the first source value arrives`, () => {
    testScheduler.run((helpers) => {
      const { cold, hot, expectObservable } = helpers;
      const source = cold('---------a|', { a: 1, b: 3, c: 5 });
      const inner =   hot('---a|', { a: 10 });
      const expected =    '----------|';

      const concated = source.pipe(
        concatMap((value) => inner.pipe(map(() => value * 10)))
      );

      concated.subscribe((val) => console.log(val));

      expectObservable(concated).toBe(expected);
    });
  });
});
