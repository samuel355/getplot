import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock PropertyCarousel to avoid touching Supabase in this test
jest.mock('../app/_components/PropertyCarousel', () => () => (
  <div data-testid="property-carousel" />
));

import Home from '../app/page';

describe('Home page', () => {
  it('renders the featured properties heading', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { name: /featured properties/i })
    ).toBeInTheDocument();
  });
});

