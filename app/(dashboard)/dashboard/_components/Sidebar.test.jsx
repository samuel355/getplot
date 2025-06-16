import { render, screen, cleanup } from '@testing-library/react';
import Sidebar from './Sidebar';
import { usePathname, useSearchParams } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
  useClerk: jest.fn(() => ({
    signOut: jest.fn(),
  })),
  UserButton: () => <div data-testid="user-button" />,
}));

describe('Sidebar', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/dashboard'); // Default path for tests
    useSearchParams.mockReturnValue({ get: (key) => (key === 'table' ? 'dashboard' : null) });
    useUser.mockReturnValue({
      user: {
        fullName: 'Test User',
        username: 'testuser',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        imageUrl: 'https://example.com/avatar.jpg',
      },
      isSignedIn: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the Dashboard link', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders the Users link', () => {
    render(<Sidebar />);
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('displays the user\'s full name and email', () => {
    render(<Sidebar />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders the "Sites Dashboard" title', () => {
    render(<Sidebar />);
    expect(screen.getByText('SITES DASHBOARD')).toBeInTheDocument();
  });

  it('applies active styling to the current path', () => {
    usePathname.mockReturnValue('/dashboard/users');
    render(<Sidebar />);
    const usersLink = screen.getByText('Users').closest('a');
    expect(usersLink).toHaveClass('bg-primary');
    expect(usersLink).toHaveClass('text-primary-foreground');
  });

  it('renders interested clients section title', () => {
    render(<Sidebar />);
    expect(screen.getByText('Interested Clients')).toBeInTheDocument();
  });
}); 