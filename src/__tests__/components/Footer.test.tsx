import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '@/components/layout/Footer';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Facebook: (props: any) => <svg data-testid="facebook-icon" {...props} />,
  Twitter: (props: any) => <svg data-testid="twitter-icon" {...props} />,
  Linkedin: (props: any) => <svg data-testid="linkedin-icon" {...props} />,
  Mail: (props: any) => <svg data-testid="mail-icon" {...props} />,
  Phone: (props: any) => <svg data-testid="phone-icon" {...props} />,
  MapPin: (props: any) => <svg data-testid="map-icon" {...props} />,
  Globe: (props: any) => <svg data-testid="globe-icon" {...props} />,
  ArrowRight: (props: any) => <svg data-testid="arrow-icon" {...props} />,
}));

// Mock i18n hook
const mockUseLocale = vi.fn();
vi.mock('@/lib/i18n', () => ({
  useLocale: () => mockUseLocale(),
}));

// Mock unified-data
const mockFetchUnifiedSettings = vi.fn();
vi.mock('@/data/unified-data', () => ({
  fetchUnifiedSettings: () => mockFetchUnifiedSettings(),
}));

describe('Footer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    mockUseLocale.mockReturnValue({
      locale: 'en',
      t: (key: string) => {
        const translations: Record<string, string> = {
          'footer.companyDescription': 'Professional tool cabinet manufacturer with 20+ years of experience.',
          'footer.quickLinks': 'Quick Links',
          'footer.contactInfo': 'Contact Info',
          'footer.copyright': 'All rights reserved.',
          'nav.home': 'Home',
          'nav.products': 'Products',
          'nav.about': 'About',
          'nav.solutions': 'Solutions',
          'nav.faq': 'FAQ',
          'nav.contact': 'Contact',
          'nav.blog': 'Blog',
        };
        return translations[key] || key;
      },
    });

    mockFetchUnifiedSettings.mockResolvedValue({
      companyName: 'WS Tool Cabinet',
      companyNameZh: '沃思工具柜',
      companyNameAr: 'خزانة أدوات WS',
      contactEmail: 'sabrina@wstoolcabinet.com',
      contactPhone: '+86 156 2216 0659',
      address: '2nd Floor No.131, Jinlong Road, Dalong Street, Panyu, Guangzhou, China',
      addressZh: '中国广州市番禺区大龙街道金龙路131号2楼',
      addressAr: 'الصين، غوانغتشو، بانيو، شارع دالونغ، رقم 131، الطابق الثاني',
      socialFacebook: 'https://facebook.com/wstoolcabinet',
      socialTwitter: 'https://twitter.com/wstoolcabinet',
      socialLinkedin: 'https://linkedin.com/company/wstoolcabinet',
      footerCopyright: '© {year} {company}. All rights reserved.',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render footer with company name', async () => {
    render(<Footer />);
    
    await waitFor(() => {
      expect(screen.getByText('WS Tool Cabinet')).toBeInTheDocument();
    });
  });

  it('should render company description', async () => {
    render(<Footer />);
    
    await waitFor(() => {
      expect(
        screen.getByText('Professional tool cabinet manufacturer with 20+ years of experience.')
      ).toBeInTheDocument();
    });
  });

  it('should render quick links section', async () => {
    render(<Footer />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Links')).toBeInTheDocument();
      // Use getAllByText since "Home" appears in both quick links and bottom bar
      expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Solutions')).toBeInTheDocument();
    });
  });

  it('should render contact information', async () => {
    render(<Footer />);
    
    await waitFor(() => {
      expect(screen.getByText('Contact Info')).toBeInTheDocument();
      expect(screen.getByText('sabrina@wstoolcabinet.com')).toBeInTheDocument();
      expect(screen.getByText('+86 156 2216 0659')).toBeInTheDocument();
    });
  });

  it('should render social media links when provided', async () => {
    render(<Footer />);
    
    await waitFor(() => {
      expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
      expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
      expect(screen.getByTestId('linkedin-icon')).toBeInTheDocument();
    });
  });

  it('should render copyright with current year', async () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);
    
    await waitFor(() => {
      expect(
        screen.getByText(`© ${currentYear} Guangzhou Qiuyan Technology Co., Ltd. All rights reserved.`)
      ).toBeInTheDocument();
    });
  });

  it('should have proper links to important pages', async () => {
    render(<Footer />);
    
    await waitFor(() => {
      // Get all "Home" links and check the first one (in quick links section)
      const homeLinks = screen.getAllByText('Home');
      expect(homeLinks[0].closest('a')).toHaveAttribute('href', '/en');
      
      const productsLink = screen.getByText('Products').closest('a');
      expect(productsLink).toHaveAttribute('href', '/en/products');
    });
  });

  it('should display localized company name for Chinese', async () => {
    mockUseLocale.mockReturnValue({
      locale: 'zh',
      t: (key: string) => key,
    });

    mockFetchUnifiedSettings.mockResolvedValue({
      companyName: 'WS Tool Cabinet',
      companyNameZh: '沃思工具柜',
      companyNameAr: 'خزانة أدوات WS',
    });

    render(<Footer />);
    
    await waitFor(() => {
      // Company name appears in brand section - use getAllByText since it might appear multiple times
      const companyNameElements = screen.getAllByText('沃思工具柜');
      expect(companyNameElements.length).toBeGreaterThan(0);
    });
  });

  it('should display localized address for different locales', async () => {
    mockUseLocale.mockReturnValue({
      locale: 'zh',
      t: (key: string) => key,
    });

    render(<Footer />);
    
    await waitFor(() => {
      expect(
        screen.getByText('中国广州市番禺区大龙街道金龙路131号2楼')
      ).toBeInTheDocument();
    });
  });

  it('should handle missing settings gracefully', async () => {
    mockFetchUnifiedSettings.mockRejectedValue(new Error('Failed to load'));
    
    render(<Footer />);
    
    // Should still render with default values
    await waitFor(() => {
      expect(screen.getByText('WS Tool Cabinet')).toBeInTheDocument();
    });
  });

  it('should render multiple contact emails when provided', async () => {
    mockFetchUnifiedSettings.mockResolvedValue({
      contactEmails: ['sabrina@wstoolcabinet.com', 'sales@wstoolcabinet.com'],
      contactPhones: ['+86 156 2216 0659', '+86 20 1234 5678'],
    });

    render(<Footer />);
    
    await waitFor(() => {
      expect(screen.getByText('sabrina@wstoolcabinet.com')).toBeInTheDocument();
      expect(screen.getByText('sales@wstoolcabinet.com')).toBeInTheDocument();
    });
  });

  it('should have proper hover effects on links', async () => {
    render(<Footer />);
    
    await waitFor(() => {
      const links = screen.getAllByRole('link');
      // Check that links have hover effects (not all are blue - phone uses green, etc.)
      links.forEach(link => {
        const classList = link.className;
        expect(classList).toMatch(/hover:text-(blue|green|red|gray)-/);
      });
    });
  });

  it('should render animated background elements', () => {
    render(<Footer />);
    
    // Check for animated gradient background
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveStyle({ backgroundColor: '#0f172a' });
  });
});
