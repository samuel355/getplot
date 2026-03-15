import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock Header and Map to avoid Next router and heavy map libs in this test
jest.mock('../app/_components/Header', () => () => (
  <div data-testid="header" />
));

jest.mock('../app/_components/Map', () => {
  return function MockMap(props) {
    return (
      <div data-testid="mock-map">
        Mock Map - center: {JSON.stringify(props.center)}
      </div>
    );
  };
});

// Import the page component after mocks
import AsokoreMampongPage from '../app/(routes)/asokore-mampong/page';

describe('Asokore Mampong page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders map and heading', () => {
    render(<AsokoreMampongPage />);

    expect(
      screen.getByRole('heading', { name: /asokore mampong site/i })
    ).toBeInTheDocument();

    expect(screen.getByTestId('mock-map')).toBeInTheDocument();
  });
});

