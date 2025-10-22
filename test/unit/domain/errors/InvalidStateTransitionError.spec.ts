import { InvalidStateTransitionError } from '../../../../src/domain/errors/InvalidStateTransitionError';

describe('InvalidStateTransitionError', () => {
  it('should create error with correct message', () => {
    const error = new InvalidStateTransitionError('CLOSED', 'RESOLVED');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Invalid state transition from CLOSED to RESOLVED');
  });

  it('should have correct error name', () => {
    const error = new InvalidStateTransitionError('OPEN', 'IN_PROGRESS');

    expect(error.name).toBe('InvalidStateTransitionError');
  });

  it('should be throwable', () => {
    expect(() => {
      throw new InvalidStateTransitionError('RESOLVED', 'IN_PROGRESS');
    }).toThrow('Invalid state transition from RESOLVED to IN_PROGRESS');
  });

  it('should be catchable as InvalidStateTransitionError', () => {
    try {
      throw new InvalidStateTransitionError('CLOSED', 'IN_PROGRESS');
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidStateTransitionError);
      expect((error as InvalidStateTransitionError).name).toBe('InvalidStateTransitionError');
    }
  });

  it('should work with all state combinations', () => {
    const error1 = new InvalidStateTransitionError('OPEN', 'OPEN');
    expect(error1.message).toBe('Invalid state transition from OPEN to OPEN');

    const error2 = new InvalidStateTransitionError('IN_PROGRESS', 'IN_PROGRESS');
    expect(error2.message).toBe('Invalid state transition from IN_PROGRESS to IN_PROGRESS');

    const error3 = new InvalidStateTransitionError('RESOLVED', 'RESOLVED');
    expect(error3.message).toBe('Invalid state transition from RESOLVED to RESOLVED');

    const error4 = new InvalidStateTransitionError('CLOSED', 'CLOSED');
    expect(error4.message).toBe('Invalid state transition from CLOSED to CLOSED');
  });
});

