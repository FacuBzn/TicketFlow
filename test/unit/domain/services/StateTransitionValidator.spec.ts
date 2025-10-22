import { StateTransitionValidator } from '../../../../src/domain/services/StateTransitionValidator';
import { InvalidStateTransitionError } from '../../../../src/domain/errors/InvalidStateTransitionError';

describe('StateTransitionValidator', () => {
  describe('validate', () => {
    describe('OPEN transitions', () => {
      it('should allow OPEN → IN_PROGRESS', () => {
        expect(() => {
          StateTransitionValidator.validate('OPEN', 'IN_PROGRESS');
        }).not.toThrow();
      });

      it('should allow OPEN → RESOLVED', () => {
        expect(() => {
          StateTransitionValidator.validate('OPEN', 'RESOLVED');
        }).not.toThrow();
      });

      it('should allow OPEN → CLOSED', () => {
        expect(() => {
          StateTransitionValidator.validate('OPEN', 'CLOSED');
        }).not.toThrow();
      });

      it('should not allow OPEN → OPEN', () => {
        // Same state transition is not in the allowed list
        expect(() => {
          StateTransitionValidator.validate('OPEN', 'OPEN');
        }).toThrow(InvalidStateTransitionError);
      });
    });

    describe('IN_PROGRESS transitions', () => {
      it('should allow IN_PROGRESS → OPEN', () => {
        expect(() => {
          StateTransitionValidator.validate('IN_PROGRESS', 'OPEN');
        }).not.toThrow();
      });

      it('should allow IN_PROGRESS → RESOLVED', () => {
        expect(() => {
          StateTransitionValidator.validate('IN_PROGRESS', 'RESOLVED');
        }).not.toThrow();
      });

      it('should allow IN_PROGRESS → CLOSED', () => {
        expect(() => {
          StateTransitionValidator.validate('IN_PROGRESS', 'CLOSED');
        }).not.toThrow();
      });

      it('should not allow IN_PROGRESS → IN_PROGRESS', () => {
        expect(() => {
          StateTransitionValidator.validate('IN_PROGRESS', 'IN_PROGRESS');
        }).toThrow(InvalidStateTransitionError);
      });
    });

    describe('RESOLVED transitions', () => {
      it('should allow RESOLVED → OPEN', () => {
        expect(() => {
          StateTransitionValidator.validate('RESOLVED', 'OPEN');
        }).not.toThrow();
      });

      it('should allow RESOLVED → CLOSED', () => {
        expect(() => {
          StateTransitionValidator.validate('RESOLVED', 'CLOSED');
        }).not.toThrow();
      });

      it('should throw InvalidStateTransitionError for RESOLVED → IN_PROGRESS', () => {
        expect(() => {
          StateTransitionValidator.validate('RESOLVED', 'IN_PROGRESS');
        }).toThrow(InvalidStateTransitionError);
      });

      it('should not allow RESOLVED → RESOLVED', () => {
        expect(() => {
          StateTransitionValidator.validate('RESOLVED', 'RESOLVED');
        }).toThrow(InvalidStateTransitionError);
      });
    });

    describe('CLOSED transitions', () => {
      it('should allow CLOSED → OPEN (reopen)', () => {
        expect(() => {
          StateTransitionValidator.validate('CLOSED', 'OPEN');
        }).not.toThrow();
      });

      it('should throw InvalidStateTransitionError for CLOSED → IN_PROGRESS', () => {
        expect(() => {
          StateTransitionValidator.validate('CLOSED', 'IN_PROGRESS');
        }).toThrow(InvalidStateTransitionError);
      });

      it('should throw InvalidStateTransitionError for CLOSED → RESOLVED', () => {
        expect(() => {
          StateTransitionValidator.validate('CLOSED', 'RESOLVED');
        }).toThrow(InvalidStateTransitionError);
      });

      it('should not allow CLOSED → CLOSED', () => {
        expect(() => {
          StateTransitionValidator.validate('CLOSED', 'CLOSED');
        }).toThrow(InvalidStateTransitionError);
      });
    });

    describe('error messages', () => {
      it('should have correct error message for invalid transitions', () => {
        expect(() => {
          StateTransitionValidator.validate('CLOSED', 'RESOLVED');
        }).toThrow('Invalid state transition from CLOSED to RESOLVED');
      });

      it('should have correct error message for RESOLVED → IN_PROGRESS', () => {
        expect(() => {
          StateTransitionValidator.validate('RESOLVED', 'IN_PROGRESS');
        }).toThrow('Invalid state transition from RESOLVED to IN_PROGRESS');
      });

      it('should have correct error name', () => {
        try {
          StateTransitionValidator.validate('CLOSED', 'RESOLVED');
        } catch (error) {
          expect(error).toBeInstanceOf(InvalidStateTransitionError);
          expect((error as Error).name).toBe('InvalidStateTransitionError');
        }
      });
    });
  });

  describe('isValidTransition', () => {
    it('should return true for valid transitions', () => {
      expect(StateTransitionValidator.isValidTransition('OPEN', 'IN_PROGRESS')).toBe(true);
      expect(StateTransitionValidator.isValidTransition('OPEN', 'RESOLVED')).toBe(true);
      expect(StateTransitionValidator.isValidTransition('OPEN', 'CLOSED')).toBe(true);
      expect(StateTransitionValidator.isValidTransition('IN_PROGRESS', 'OPEN')).toBe(true);
      expect(StateTransitionValidator.isValidTransition('IN_PROGRESS', 'RESOLVED')).toBe(true);
      expect(StateTransitionValidator.isValidTransition('IN_PROGRESS', 'CLOSED')).toBe(true);
      expect(StateTransitionValidator.isValidTransition('RESOLVED', 'OPEN')).toBe(true);
      expect(StateTransitionValidator.isValidTransition('RESOLVED', 'CLOSED')).toBe(true);
      expect(StateTransitionValidator.isValidTransition('CLOSED', 'OPEN')).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      expect(StateTransitionValidator.isValidTransition('RESOLVED', 'IN_PROGRESS')).toBe(false);
      expect(StateTransitionValidator.isValidTransition('CLOSED', 'RESOLVED')).toBe(false);
      expect(StateTransitionValidator.isValidTransition('CLOSED', 'IN_PROGRESS')).toBe(false);
      expect(StateTransitionValidator.isValidTransition('OPEN', 'OPEN')).toBe(false);
      expect(StateTransitionValidator.isValidTransition('IN_PROGRESS', 'IN_PROGRESS')).toBe(false);
      expect(StateTransitionValidator.isValidTransition('RESOLVED', 'RESOLVED')).toBe(false);
      expect(StateTransitionValidator.isValidTransition('CLOSED', 'CLOSED')).toBe(false);
    });
  });
});

