import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { actions } from './+page.server';
import { TastyTradeApi } from '$lib/services/tastytrade-api';
import { SessionManager } from '$lib/services/session';
import { fail, redirect } from '@sveltejs/kit';

vi.mock('$lib/services/tastytrade-api', () => {
  return {
    TastyTradeApi: vi.fn().mockImplementation(() => ({
      createSession: vi.fn()
    }))
  };
});

vi.mock('$lib/services/session', () => {
  return {
    SessionManager: vi.fn().mockImplementation(() => ({
      createSession: vi.fn()
    }))
  };
});

vi.mock('@sveltejs/kit', async () => {
  const actual = await vi.importActual('@sveltejs/kit');
  return {
    ...actual,
    fail: vi.fn((code, data) => ({ status: code, data })),
    redirect: vi.fn((code, location) => {
      const error = new Error(`Redirect to ${location}`);
      error.status = code;
      throw error;
    })
  };
});

describe('Login action', () => {
  let mockRequest: Request;
  let mockCookies: any;
  let mockFormData: FormData;
  let mockApi: { createSession: vi.Mock };
  let mockSessionManager: { createSession: vi.Mock };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockFormData = new FormData();
    mockRequest = {
      formData: vi.fn().mockResolvedValue(mockFormData)
    } as unknown as Request;
    
    mockCookies = {
      set: vi.fn(),
      get: vi.fn(),
      delete: vi.fn()
    };
    
    mockApi = {
      createSession: vi.fn()
    };
    (TastyTradeApi as any).mockImplementation(() => mockApi);
    
    mockSessionManager = {
      createSession: vi.fn()
    };
    (SessionManager as any).mockImplementation(() => mockSessionManager);
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  it('should return a 400 error when username is missing', async () => {
    mockFormData.append('password', 'testpassword');
    
    const result = await actions.login({ request: mockRequest, cookies: mockCookies } as any);
    
    expect(fail).toHaveBeenCalledWith(400, {
      error: 'Username and password are required',
      username: null  
    });
    expect(mockApi.createSession).not.toHaveBeenCalled();
    expect(mockSessionManager.createSession).not.toHaveBeenCalled();
  });
  
  it('should return a 400 error when password is missing', async () => {
    mockFormData.append('username', 'testuser');
    
    const result = await actions.login({ request: mockRequest, cookies: mockCookies } as any);
    
    expect(fail).toHaveBeenCalledWith(400, {
      error: 'Username and password are required',
      username: 'testuser'
    });
    expect(mockApi.createSession).not.toHaveBeenCalled();
    expect(mockSessionManager.createSession).not.toHaveBeenCalled();
  });
  
  it('should create a session and redirect on successful login', async () => {
    mockFormData.append('username', 'testuser');
    mockFormData.append('password', 'testpassword');
    
    const mockSessionResponse = {
      data: {
        'session-token': 'test-token',
        'session-expiration': '2023-12-31T23:59:59Z',
        user: { username: 'testuser' }
      }
    };
    
    mockApi.createSession.mockResolvedValue(mockSessionResponse);
    
    await expect(async () => {
      await actions.login({ request: mockRequest, cookies: mockCookies } as any);
    }).rejects.toThrow();
    
    expect(mockApi.createSession).toHaveBeenCalled();
    expect(mockSessionManager.createSession).toHaveBeenCalledWith({
      sessionToken: 'test-token',
      sessionExpiration: '2023-12-31T23:59:59Z',
      user: { username: 'testuser' }
    });
    expect(redirect).toHaveBeenCalledWith(303, '/dashboard');
  });
  
  it('should handle API errors properly', async () => {
    mockFormData.append('username', 'testuser');
    mockFormData.append('password', 'testpassword');
    
    const apiError = new Error('Invalid credentials');
    mockApi.createSession.mockRejectedValue(apiError);
    
    const result = await actions.login({ request: mockRequest, cookies: mockCookies } as any);
    
    expect(fail).toHaveBeenCalledWith(500, {
      error: 'Invalid credentials',
      username: 'testuser'
    });
    expect(mockSessionManager.createSession).not.toHaveBeenCalled();
  });
  
  it('should handle unexpected errors', async () => {
    mockFormData.append('username', 'testuser');
    mockFormData.append('password', 'testpassword');
    
    mockApi.createSession.mockRejectedValue('Unexpected error');
    
    const result = await actions.login({ request: mockRequest, cookies: mockCookies } as any);
    
    expect(fail).toHaveBeenCalledWith(500, {
      error: 'An unexpected error occurred. Please try again.',
      username: 'testuser'
    });
    expect(mockSessionManager.createSession).not.toHaveBeenCalled();
  });
});