import { initializeSocket, getSocket, disconnectSocket } from '../../services/socketService';
import { io } from 'socket.io-client';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock socket.io-client
vi.mock('socket.io-client', () => {
  return {
    io: vi.fn()
  };
});

describe('Socket Service', () => {
  let mockSocket;
  
  beforeEach(() => {
    // Create a mock socket object
    mockSocket = {
      id: 'mock-socket-id',
      connected: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
      on: vi.fn(),
    };
    
    // Reset the mocked io function
    io.mockReset();
    io.mockReturnValue(mockSocket);
    
    // Clear any console mocks
    vi.spyOn(console, 'log').mockClear();
    vi.spyOn(console, 'error').mockClear();
  });
  
  afterEach(() => {
    // Disconnect socket to reset state
    disconnectSocket();
  });
  
  it('should initialize a new socket connection with the provided token', () => {
    const token = 'test-token';
    const result = initializeSocket(token);
    
    // Check that io was called with the correct parameters
    expect(io).toHaveBeenCalledWith('http://localhost:3200', {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 30,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      autoConnect: true,
    });
    
    // Check that event listeners were added
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('messageCreated', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
    
    // Check that the function returns the socket
    expect(result).toBe(mockSocket);
  });
  
  it('should reuse existing connected socket', () => {
    // First create a socket
    const token = 'test-token';
    mockSocket.connected = true;
    
    const firstResult = initializeSocket(token);
    expect(io).toHaveBeenCalledTimes(1);
    
    // Reset the mock to check if it's called again
    io.mockClear();
    
    // Second call should reuse existing socket
    const secondResult = initializeSocket(token);
    
    // Check that io was not called again
    expect(io).not.toHaveBeenCalled();
    
    // Both results should be the same socket
    expect(secondResult).toBe(firstResult);
  });
  
  it('should reconnect disconnected socket', () => {
    // First create a socket
    const token = 'test-token';
    mockSocket.connected = false;
    
    const socket = initializeSocket(token);
    
    // Reset the io mock to check if it's called again
    io.mockClear();
    
    // Try to initialize again with a disconnected socket
    initializeSocket(token);
    
    // Should try to reconnect rather than create a new socket
    expect(io).not.toHaveBeenCalled();
    expect(mockSocket.connect).toHaveBeenCalled();
  });
  
  it('should be able to get the current socket', () => {
    const token = 'test-token';
    const socket = initializeSocket(token);
    
    const result = getSocket();
    
    expect(result).toBe(socket);
  });
  
  it('should properly disconnect the socket', () => {
    const token = 'test-token';
    initializeSocket(token);
    
    disconnectSocket();
    
    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(getSocket()).toBeNull();
  });
}); 