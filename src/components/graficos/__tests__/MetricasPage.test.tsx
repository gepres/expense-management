/**
 * Tests de gating de MetricasPage:
 *  - no-pro            → Teaser
 *  - pro + mobile       → Mobile
 *  - pro + escritorio   → Desktop
 *
 * Los hijos se mockean a stubs para aislar la lógica de routing.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricasPage from '../MetricasPage';

const useAuthMock = vi.fn();
const useIsMobileMock = vi.fn();

vi.mock('@context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('@hooks/useBreakpoints', () => ({
  useIsMobile: () => useIsMobileMock(),
}));

vi.mock('../MetricasDesktop', () => ({
  default: () => <div>STUB_DESKTOP</div>,
}));
vi.mock('../mobile/MetricasMobile', () => ({
  default: () => <div>STUB_MOBILE</div>,
}));
vi.mock('../MetricasTeaser', () => ({
  default: () => <div>STUB_TEASER</div>,
}));

describe('MetricasPage gating', () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    useIsMobileMock.mockReset();
  });

  it('usuario no-pro ve el teaser', () => {
    useAuthMock.mockReturnValue({ isPro: false });
    useIsMobileMock.mockReturnValue(false);
    render(<MetricasPage />);
    expect(screen.getByText('STUB_TEASER')).toBeInTheDocument();
  });

  it('pro en mobile ve la versión mobile', () => {
    useAuthMock.mockReturnValue({ isPro: true });
    useIsMobileMock.mockReturnValue(true);
    render(<MetricasPage />);
    expect(screen.getByText('STUB_MOBILE')).toBeInTheDocument();
  });

  it('pro en escritorio ve el dashboard completo', () => {
    useAuthMock.mockReturnValue({ isPro: true });
    useIsMobileMock.mockReturnValue(false);
    render(<MetricasPage />);
    expect(screen.getByText('STUB_DESKTOP')).toBeInTheDocument();
  });
});
