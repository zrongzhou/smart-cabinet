import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Hermetic mocks so the component renders without its data/cart layers.
vi.mock('@/context/CartContext', () => ({
  useCart: () => ({ addItem: vi.fn() }),
}));
vi.mock('@/components/products/ReviewList', () => ({
  default: () => null,
}));
vi.mock('@/components/ui/SafeImage', () => ({
  default: () => null,
}));

import ProductDetailClient from '@/components/products/ProductDetailClient';

const labels = {
  home: 'Home',
  productsTitle: 'Products',
  favorite: 'Favorite',
  imageNotAvailable: 'Image not available',
  clickToZoom: 'Click to zoom',
  backToProducts: 'Back to products',
  description: 'Description',
  specifications: 'Specifications',
  features: 'Features',
  reviews: 'Reviews',
  relatedProducts: 'Related',
  contactForPricing: 'Contact for pricing',
  contactUs: 'Contact us',
  share: 'Share',
  priceOnRequest: 'Price on request',
} as Record<string, string>;

const baseProduct = (specs: any) => ({
  id: 'p1',
  slug: 'tool-vending-machine-cnc-tools.html',
  sku: 'SKU-001',
  price: 0,
  hidePrice: true,
  images: [],
  categories: [],
  _resolvedName: 'CNC Tool Vending Machine',
  _resolvedDescription: 'A smart cabinet.',
  _resolvedSpecs: specs,
  _resolvedFeatures: [],
});

/**
 * P2 regression: ProductDetailClient must render BOTH the
 * [{param,value}] array shape AND the plain key-value object shape of
 * `specs` through a real <table> (not a flat string). The legacy
 * string shape must keep rendering as text (no table).
 */
describe('P2 ProductDetailClient — specs render as a table', () => {
  it('array shape [{param,value}] -> <table> with param/value cells', async () => {
    const product = baseProduct([
      { param: 'Model', value: 'LY-800' },
      { param: 'Size', value: '600x400mm' },
    ]);
    render(<ProductDetailClient product={product as any} locale="en" labels={labels} relatedProducts={[]} />);

    // Open the Specifications tab.
    fireEvent.click(screen.getByText('Specifications'));

    const modelCell = await screen.findByText('Model');
    expect(modelCell.closest('table')).toBeInTheDocument();
    expect(screen.getByText('LY-800')).toBeInTheDocument();
    expect(screen.getByText('600x400mm')).toBeInTheDocument();
  });

  it('plain key-value object shape -> <table> rows', async () => {
    const product = baseProduct({ Model: 'LY-800', Material: 'Steel' });
    render(<ProductDetailClient product={product as any} locale="en" labels={labels} relatedProducts={[]} />);

    fireEvent.click(screen.getByText('Specifications'));

    const modelCell = await screen.findByText('Model');
    expect(modelCell.closest('table')).toBeInTheDocument();
    expect(screen.getByText('LY-800')).toBeInTheDocument();
    expect(screen.getByText('Steel')).toBeInTheDocument();
  });

  it('legacy string shape -> rendered as text, NOT a table', async () => {
    const product = baseProduct('This is a plain spec paragraph.');
    render(<ProductDetailClient product={product as any} locale="en" labels={labels} relatedProducts={[]} />);

    fireEvent.click(screen.getByText('Specifications'));

    await waitFor(() =>
      expect(screen.getByText('This is a plain spec paragraph.')).toBeInTheDocument(),
    );
    // No spec table should be produced for a raw string.
    expect(document.querySelector('table')).toBeNull();
  });

  it('empty specs -> Specifications tab is not shown', () => {
    const product = baseProduct({});
    render(<ProductDetailClient product={product as any} locale="en" labels={labels} relatedProducts={[]} />);
    expect(screen.queryByText('Specifications')).toBeNull();
  });
});
