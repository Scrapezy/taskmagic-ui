/**
 * Basic test to ensure the test environment is working
 */

describe('Basic Test Suite', () => {
    test('should pass a basic test', () => {
        expect(1 + 1).toBe(2);
    });

    test('should pass another basic test', () => {
        expect('hello').toBe('hello');
    });
}); 