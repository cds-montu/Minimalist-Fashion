import { delay } from 'core/utils/delay';

describe('delay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves only after the given number of milliseconds', async () => {
    const onResolved = jest.fn();
    delay(500).then(onResolved);

    jest.advanceTimersByTime(499);
    await Promise.resolve();
    expect(onResolved).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    await Promise.resolve();
    expect(onResolved).toHaveBeenCalledTimes(1);
  });

  it('returns a promise', () => {
    const promise = delay(0);
    expect(promise).toBeInstanceOf(Promise);
    jest.runAllTimers();
    return promise;
  });
});
