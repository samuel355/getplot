import '@testing-library/jest-dom';

// Mock Clerk to avoid loading its browser/runtime crypto in Jest
jest.mock('@clerk/nextjs', () => {
  const React = require('react');
  return {
    __esModule: true,
    ClerkProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    SignedIn: ({ children }) => React.createElement(React.Fragment, null, children),
    SignedOut: ({ children }) => React.createElement(React.Fragment, null, children),
    UserButton: () => null,
    useUser: () => ({ isSignedIn: false, user: null }),
  };
});

// Mock Next.js app router hooks used in components/pages
jest.mock('next/navigation', () => {
  return {
    __esModule: true,
    useRouter: () => ({
      prefetch: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }),
    usePathname: () => '/',
  };
});

// Provide a safe mock Supabase client for tests so components importing it don't
// require a real NEXT_PUBLIC_SUPABASE_ANON_KEY
jest.mock('@/utils/supabase/client', () => {
  const mockFrom = jest.fn(() => ({
    select: jest.fn().mockResolvedValue({ data: [], error: null }),
    insert: jest.fn().mockResolvedValue({ data: [], error: null }),
  }));

  return {
    supabase: {
      from: mockFrom,
    },
  };
});