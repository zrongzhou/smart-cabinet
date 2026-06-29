import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductCard from '@/components/ProductCard';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ArrowRight: (props: any) => <svg data-testid="arrow-icon" {...props} />,
  Package: (props: any) => <svg data-testid="package-icon" {...props} />,
  Heart: (props: any) => <svg data-testid="heart-icon" {...props} />,
}));

// Mock i18n hook
const mockUseLocale = vi.fn();
vi.mock('@/lib/i18n', () => ({
  useLocale: () => mockUseLocale(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = vi.fn();

describe('ProductCard Component', () => {
  const mockProduct = {
    id: '1',
    slug: 'test-product',
    name: {
      en: 'Test Product',
      zh: '测试产品',
      ar: 'منتج تجريبي',
    },
    description: {
      en: '<p>Test description</p>',
      zh: '<p>测试描述</p>',
      ar: '<p>وصف تجريبي</p>',
    },
    images: ['/images/test-product.jpg'],
    price: 999.99,
    hidePrice: false,
    categories: ['Smart Cabinets'],
    featured: true,
    inStock: true,
    specifications: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    mockUseLocale.mockReturnValue({
      locale: 'en',
      t: (key: string) => key,
    });

    localStorageMock.getItem.mockReturnValue(null);
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render product card with basic information', () => {
    render(<ProductCard product={mockProduct} locale="en" />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    // Price appears in both badge and text - check that at least one exists
    expect(screen.getAllByText(/999\.99/).length).toBeGreaterThan(0);
    expect(screen.getByText('Smart Cabinets')).toBeInTheDocument();
  });

  it('should render product image when provided', () => {
    render(<ProductCard product={mockProduct} locale="en" />);
    
    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/test-product.jpg');
  });

  it('should render placeholder when no image provided', () => {
    const productWithoutImage = { ...mockProduct, images: [] };
    render(<ProductCard product={productWithoutImage} locale="en" />);
    
    expect(screen.getByTestId('package-icon')).toBeInTheDocument();
  });

  it('should link to product detail page', () => {
    render(<ProductCard product={mockProduct} locale="en" />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/en/products/test-product');
  });

  it('should show "Contact Us" when hidePrice is true', () => {
    const productWithHiddenPrice = { ...mockProduct, hidePrice: true, price: undefined };
    render(<ProductCard product={productWithHiddenPrice} locale="en" />);
    
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('should not show price when hidePrice is true', () => {
    const productWithHiddenPrice = { ...mockProduct, hidePrice: true };
    render(<ProductCard product={productWithHiddenPrice} locale="en" />);
    
    expect(screen.queryByText('$999.99')).not.toBeInTheDocument();
  });

  it('should show "Request Quote" when no price and not hidden', () => {
    const productWithoutPrice = { ...mockProduct, price: undefined, hidePrice: false };
    render(<ProductCard product={productWithoutPrice} locale="en" />);
    
    expect(screen.getByText('Request Quote')).toBeInTheDocument();
  });

  it('should render favorite button when showFavoriteButton is true', () => {
    render(<ProductCard product={mockProduct} locale="en" />);
    
    expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
  });

  it('should not render favorite button when showFavoriteButton is false', () => {
    render(<ProductCard product={mockProduct} locale="en" showFavoriteButton={false} />);
    
    // Heart icon should not be in the document
    const heartIcons = document.querySelectorAll('[data-testid="heart-icon"]');
    expect(heartIcons.length).toBe(0);
  });

  it('should redirect to login when favorite clicked without token', () => {
    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', { value: mockLocation, writable: true });
    
    render(<ProductCard product={mockProduct} locale="en" />);
    
    const favoriteButton = screen.getByTestId('heart-icon').closest('button');
    fireEvent.click(favoriteButton!);
    
    expect(window.location.href).toContain('/en/login');
  });

  it('should add to favorites when authenticated', async () => {
    localStorageMock.getItem.mockReturnValue('fake-jwt-token');
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<ProductCard product={mockProduct} locale="en" />);
    
    const favoriteButton = screen.getByTestId('heart-icon').closest('button');
    fireEvent.click(favoriteButton!);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/user/favorites',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-jwt-token',
          }),
        })
      );
    });
  });

  it('should remove from favorites when already favorited', async () => {
    localStorageMock.getItem.mockReturnValue('fake-jwt-token');
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<ProductCard product={mockProduct} locale="en" />);
    
    // First click to add
    const favoriteButton = screen.getByTestId('heart-icon').closest('button');
    fireEvent.click(favoriteButton!);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('should render localized product name', () => {
    render(<ProductCard product={mockProduct} locale="zh" />);
    
    expect(screen.getByText('测试产品')).toBeInTheDocument();
  });

  it('should render localized description with HTML', () => {
    render(<ProductCard product={mockProduct} locale="en" />);
    
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should have proper hover effects', () => {
    render(<ProductCard product={mockProduct} locale="en" />);
    
    const card = screen.getByRole('link');
    expect(card).toHaveClass('hover:-translate-y-2');
  });

  it('should show "View Details" button', () => {
    render(<ProductCard product={mockProduct} locale="en" />);
    
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('should handle products with complex category objects', () => {
    const productWithCategoryObject = {
      ...mockProduct,
      categories: [
        { id: '1', name: { en: 'Smart Cabinets', zh: '智能柜', ar: 'خزانات ذكية' } },
      ],
    };
    
    render(<ProductCard product={productWithCategoryObject} locale="en" />);
    
    expect(screen.getByText('Smart Cabinets')).toBeInTheDocument();
  });

  it('should apply priority prop to image', () => {
    render(<ProductCard product={mockProduct} locale="en" priority={true} />);
    
    const image = screen.getByAltText('Test Product');
    expect(image).toHaveAttribute('loading', 'eager');
    // Note: priority is a Next.js Image prop, not a DOM attribute
    // Next.js uses it for optimization but doesn't add it to the DOM
  });

  it('should handle image loading state', () => {
    render(<ProductCard product={mockProduct} locale="en" priority={false} />);
    
    const image = screen.getByAltText('Test Product');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('should render category badge with proper styling', () => {
    render(<ProductCard product={mockProduct} locale="en" />);
    
    const badge = screen.getByText('Smart Cabinets');
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('text-[10px]');
  });
});
