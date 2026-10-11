import { describe, it, expect } from 'bun:test';
import { packagesApi } from './packages';

describe('packagesApi Client (TDD)', () => {
  it('should export methods for packages, subscription, and bump', () => {
    expect(typeof packagesApi.getPackages).toBe('function');
    expect(typeof packagesApi.getMySubscription).toBe('function');
    expect(typeof packagesApi.bumpProperty).toBe('function');
  });
});
