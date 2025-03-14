import { decodeToken } from '../../utils/auth';
import { jwtDecode } from 'jwt-decode';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the jwt-decode module
vi.mock('jwt-decode', () => {
  return {
    jwtDecode: vi.fn()
  };
});

describe('Auth Utility Functions', () => {
  describe('decodeToken', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should decode a valid token', () => {
      const mockDecodedToken = { userId: '123', username: 'testuser' };
      jwtDecode.mockReturnValue(mockDecodedToken);
      
      const token = 'valid.jwt.token';
      const result = decodeToken(token);
      
      expect(jwtDecode).toHaveBeenCalledWith(token);
      expect(result).toEqual(mockDecodedToken);
    });

    it('should handle invalid tokens and return null', () => {
      jwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      const token = 'invalid.token';
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation();
      
      const result = decodeToken(token);
      
      expect(jwtDecode).toHaveBeenCalledWith(token);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid token');
      expect(result).toBeNull();
      
      consoleSpy.mockRestore();
    });
  });
}); 