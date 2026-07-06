import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';

// ---------------------------------------------------------------------------
// REAL SOURCE UNDER TEST: src/components/admin/ProductFaqBlock.tsx
// We render the actual client component with a mocked data layer
// (adminApi from @/data/unified-data) and assert the network calls it makes.
// ---------------------------------------------------------------------------

const { adminApi } = vi.hoisted(() => ({
  adminApi: {
    fetchAdminFaqs: vi.fn(),
    createFaq: vi.fn(),
    updateFaq: vi.fn(),
    deleteFaq: vi.fn(),
  },
}));

vi.mock('@/data/unified-data', () => ({ adminApi }));

import ProductFaqBlock from '@/components/admin/ProductFaqBlock';
import JsonTrilingualInput from '@/components/admin/JsonTrilingualInput';

const seedFaq = (over: any = {}) => ({
  id: 'f1',
  question: { en: 'Q1', zh: '问1', ar: 'س1' },
  answer: { en: 'A1', zh: '答1', ar: 'ج1' },
  category: 'features',
  status: 'active',
  order: 0,
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  (window as any).confirm = vi.fn(() => true);
  adminApi.fetchAdminFaqs.mockResolvedValue([]);
  adminApi.createFaq.mockImplementation((data: any) => Promise.resolve({ id: 'f-new', ...data }));
  adminApi.updateFaq.mockImplementation((_id: string, data: any) => Promise.resolve({ id: _id, ...data }));
  adminApi.deleteFaq.mockResolvedValue(undefined);
});

describe('E. ProductFaqBlock — frontend behaviour', () => {
  it('E1: mounts and loads FAQs for the given productId', async () => {
    adminApi.fetchAdminFaqs.mockResolvedValue([seedFaq()]);
    render(<ProductFaqBlock productId="prod-1" />);

    await waitFor(() => expect(adminApi.fetchAdminFaqs).toHaveBeenCalledWith('prod-1'));
    expect(screen.getByDisplayValue('Q1')).toBeInTheDocument();
  });

  it('E2: add row + save -> createFaq called WITH productId, payload excludes productId scalar', async () => {
    render(<ProductFaqBlock productId="prod-1" />);
    await waitFor(() => expect(adminApi.fetchAdminFaqs).toHaveBeenCalled());

    fireEvent.click(screen.getByText('添加 FAQ'));

    const enInputs = screen.getAllByPlaceholderText('请输入英文 (EN)');
    fireEvent.change(enInputs[0], { target: { value: 'NewQ' } });
    fireEvent.change(enInputs[1], { target: { value: 'NewA' } });

    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => expect(adminApi.createFaq).toHaveBeenCalled());
    const arg = adminApi.createFaq.mock.calls[0][0];
    expect(arg.productId).toBe('prod-1'); // persisted via top-level productId
    expect(arg).not.toHaveProperty('product'); // buildPayload omits it
    expect(arg.question.en).toBe('NewQ');
    expect(arg.answer.en).toBe('NewA');
  });

  it('E3: update existing row -> updateFaq called WITHOUT productId', async () => {
    adminApi.fetchAdminFaqs.mockResolvedValue([seedFaq()]);
    render(<ProductFaqBlock productId="prod-1" />);
    await waitFor(() => expect(adminApi.fetchAdminFaqs).toHaveBeenCalled());

    const enInputs = screen.getAllByPlaceholderText('请输入英文 (EN)');
    fireEvent.change(enInputs[0], { target: { value: 'Q1-updated' } });

    fireEvent.click(screen.getByText('更新'));

    await waitFor(() => expect(adminApi.updateFaq).toHaveBeenCalled());
    const [id, arg] = adminApi.updateFaq.mock.calls[0];
    expect(id).toBe('f1');
    expect((arg as any).productId).toBeUndefined();
    expect(arg).not.toHaveProperty('product'); // KEY: PUT must not touch productId
    expect(arg.question.en).toBe('Q1-updated');
  });

  it('E4: delete row -> deleteFaq called with the row id', async () => {
    adminApi.fetchAdminFaqs.mockResolvedValue([seedFaq()]);
    render(<ProductFaqBlock productId="prod-1" />);
    await waitFor(() => expect(adminApi.fetchAdminFaqs).toHaveBeenCalled());

    fireEvent.click(screen.getByTitle('删除'));

    await waitFor(() => expect(adminApi.deleteFaq).toHaveBeenCalledWith('f1'));
  });

  it('E5: move down swaps order and persists both rows via updateFaq', async () => {
    adminApi.fetchAdminFaqs.mockResolvedValue([seedFaq({ id: 'f1', order: 0 }), seedFaq({ id: 'f2', order: 1 })]);
    render(<ProductFaqBlock productId="prod-1" />);
    await waitFor(() => expect(adminApi.fetchAdminFaqs).toHaveBeenCalled());

    const downButtons = screen.getAllByTitle('下移');
    fireEvent.click(downButtons[0]); // move first row (f1) down

    await waitFor(() => expect(adminApi.updateFaq).toHaveBeenCalledTimes(2));
    const calls = adminApi.updateFaq.mock.calls as [string, any][];
    const f1 = calls.find((c) => c[0] === 'f1')!;
    const f2 = calls.find((c) => c[0] === 'f2')!;
    expect(f1[1].order).toBe(1);
    expect(f2[1].order).toBe(0);
    // neither move should ever touch productId
    expect(f1[1]).not.toHaveProperty('product');
    expect(f2[1]).not.toHaveProperty('product');
  });

  it('E6: empty state shows guidance when no FAQs', async () => {
    adminApi.fetchAdminFaqs.mockResolvedValue([]);
    render(<ProductFaqBlock productId="prod-1" />);
    await waitFor(() => expect(adminApi.fetchAdminFaqs).toHaveBeenCalled());
    expect(screen.getByText(/暂无产品 FAQ/)).toBeInTheDocument();
  });
});

describe('JsonTrilingualInput — AR RTL', () => {
  it('E7: Arabic field uses dir="rtl", English uses dir="ltr"', () => {
    render(<JsonTrilingualInput label="问题" value={{}} onChange={() => {}} />);
    const ar = screen.getByPlaceholderText('الرجاء إدخال المحتوى باللغة العربية');
    const en = screen.getByPlaceholderText('请输入英文 (EN)');
    expect(ar).toHaveAttribute('dir', 'rtl');
    expect(en).toHaveAttribute('dir', 'ltr');
  });
});
