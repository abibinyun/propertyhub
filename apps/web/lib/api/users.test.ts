import { describe, it, expect } from 'bun:test';
import { usersApi } from './users';

describe('usersApi Client (TDD)', () => {
  it('should export methods for profile, password, username, avatar, and verification', () => {
    expect(typeof usersApi.updateProfile).toBe('function');
    expect(typeof usersApi.changePassword).toBe('function');
    expect(typeof usersApi.checkUsername).toBe('function');
    expect(typeof usersApi.uploadAvatar).toBe('function');
    expect(typeof usersApi.submitVerification).toBe('function');
  });
});
