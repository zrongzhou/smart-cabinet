import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '@/components/layout/Navbar';
import { CartProvider } from '@/context/CartContext';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  Bars3Icon: (props: any) => <svg data-testid="bars-icon" {...props} />,
  XMarkIcon: (props: any) => <svg data-testid="xmark-icon" {...props} />,
  ChevronDownIcon: (props: any) => <svg data-testid="chevron-icon" {...props} />,
  UserIcon: (props: any) => <svg data-testid="user-icon" {...props} />,
  ArrowRightOnRectangleIcon: (props: any) => <svg data-testid="arrow-icon" {...props} />,
  Cog6ToothIcon: (props: any) => <svg data-testid="cog-icon" {...props} />,
}));

// Mock i18n hook
const mockUseLocale = vi.fn();
vi.mock('@/lib/i18n', () => ({
  useLocale: () => mockUseLocale(),
}));

// Mock Auth context
const mockUseAuth = vi.fn();
vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock unified-data
const mockFetchUnifiedSettings = vi.fn();
vi.mock('@/data/unified-data', () => ({
  fetchUnifiedSettings: () => mockFetchUnifiedSettings(),
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    mockUseLocale.mockReturnValue({
      locale: 'en',
      t: (key: string) => {
        const translations: Record<string, string> = {
          'nav.home': 'Home',
          'nav.products': 'Products',
          'nav.about': 'About',
          'nav.solutions': 'Solutions',
          'nav.blog': 'Blog',
          'nav.faq': 'FAQ',
          'nav.contact': 'Contact',
          'nav.getQuote': 'Get a Quote',
          'nav.language': 'Language',
        };
        return translations[key] || key;
      },
    });

    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    });

    mockFetchUnifiedSettings.mockResolvedValue({
      companyName: 'Qtech Tool Cabinet',
      companyNameZh: '秋渊工具柜',
      companyNameAr: 'قفص أدوات',
      logo: '/images/logo.svg',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render navbar with logo and company name', async () => {
    render(<CartProvider><Navbar /></CartProvider>);
    
    await waitFor(() => {
      expect(screen.getByAltText('Qtech Tool Cabinet')).toBeInTheDocument();
      expect(screen.getByText('Qtech Tool Cabinet')).toBeInTheDocument();
    });
  });

  it('should render navigation links', async () => {
    render(<CartProvider><Navbar /></CartProvider>);
    
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Solutions')).toBeInTheDocument();
      expect(screen.getByText('Blog')).toBeInTheDocument();
      expect(screen.getByText('FAQ')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });
  });

  it('should show login/register buttons when not authenticated', async () => {
    render(<CartProvider><Navbar /></CartProvider>);
    
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });
  });

  it('should show user menu when authenticated and clicked', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        name: 'Test User',
        email: 'test@example.com',
        avatar: null,
      },
      isAuthenticated: true,
      logout: vi.fn(),
    });

    render(<CartProvider><Navbar /></CartProvider>);
    
    // Click user button to open menu
    const userButton = screen.getByText('T'); // Avatar shows first letter of name
    fireEvent.click(userButton);
    
    await waitFor(() => {
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });

  it('should toggle mobile menu when hamburger button clicked', async () => {
    render(<CartProvider><Navbar /></CartProvider>);
    
    const menuButton = screen.getByLabelText('Toggle menu');
    expect(menuButton).toBeInTheDocument();
    
    // Click to open mobile menu
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      expect(screen.getByText('Language')).toBeInTheDocument();
    });
  });

  it('should switch language when language button clicked', async () => {
    render(<CartProvider><Navbar /></CartProvider>);
    
    // Open language menu
    const langButton = screen.getByText('EN');
    fireEvent.click(langButton);
    
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('简体中文')).toBeInTheDocument();
      expect(screen.getByText('العربية')).toBeInTheDocument();
    });
  });

  it('should display correct company name for different locales', async () => {
    mockUseLocale.mockReturnValue({
      locale: 'zh',
      t: (key: string) => key,
    });

    mockFetchUnifiedSettings.mockResolvedValue({
      companyName: 'Qtech Tool Cabinet',
      companyNameZh: '秋渊工具柜',
      companyNameAr: 'قفص أدوات',
      logo: '/images/logo.svg',
    });

    render(<CartProvider><Navbar /></CartProvider>);
    
    await waitFor(() => {
      expect(screen.getByText('秋渊工具柜')).toBeInTheDocument();
    });
  });

  it('should handle logo error gracefully', async () => {
    render(<CartProvider><Navbar /></CartProvider>);
    
    const logo = screen.getByAltText('Qtech Tool Cabinet');
    expect(logo).toBeInTheDocument();
    
    // Simulate image error
    fireEvent.error(logo);
    
    await waitFor(() => {
      // Should still render the fallback logo
      const logos = screen.getAllByAltText('Qtech Tool Cabinet');
      expect(logos.length).toBeGreaterThan(0);
    });
  });

  it('should call logout when sign out clicked', async () => {
    const mockLogout = vi.fn();
    mockUseAuth.mockReturnValue({
      user: {
        name: 'Test User',
        email: 'test@example.com',
        avatar: null,
      },
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(<CartProvider><Navbar /></CartProvider>);
    
    // Open user menu first by clicking avatar
    const userButton = screen.getByText('T'); // First letter of "Test"
    fireEvent.click(userButton);
    
    await waitFor(() => {
      const signOutButton = screen.getByText('Sign Out');
      fireEvent.click(signOutButton);
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('should apply RTL layout for Arabic locale', async () => {
    mockUseLocale.mockReturnValue({
      locale: 'ar',
      t: (key: string) => {
        const translations: Record<string, string> = {
          'nav.home': 'nav.home',
          'nav.products': 'nav.products',
          'nav.about': 'nav.about',
          'nav.solutions': 'nav.solutions',
          'nav.blog': 'nav.blog',
          'nav.faq': 'nav.faq',
          'nav.contact': 'nav.contact',
          'nav.getQuote': 'nav.getQuote',
          'nav.language': 'nav.language',
        };
        return translations[key] || key;
      },
    });

    render(<CartProvider><Navbar /></CartProvider>);
    
    // Open mobile menu to see sidebar
    const menuButton = screen.getByLabelText('Toggle menu');
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      // Check that the sidebar exists and has RTL class
      const sidebar = document.querySelector('[class*="fixed"][class*="top-0"]');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass('left-0');
    });
  });

  it('should have proper ARIA labels for accessibility', async () => {
    render(<CartProvider><Navbar /></CartProvider>);
    
    const menuButton = screen.getByLabelText('Toggle menu');
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-label', 'Toggle menu');
  });

  it('should have minimum touch target size for mobile', async () => {
    render(<CartProvider><Navbar /></CartProvider>);
    
    const menuButton = screen.getByLabelText('Toggle menu');
    expect(menuButton).toHaveClass('min-w-[44px]');
    expect(menuButton).toHaveClass('min-h-[44px]');
  });
});
