import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  Route: ({ element }: any) => element,
  Routes: ({ children }: any) => <div>{children}</div>,
  useNavigate: () => jest.fn(),
}), { virtual: true });

jest.mock('./Components/Home', () => () => <div>Home Mock</div>);

import App from './App';

test('renders home component', () => {
  render(<App />);
  const heading = screen.getByText(/Home Mock/i);
  expect(heading).toBeInTheDocument();
});
