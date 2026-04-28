import { useState } from 'react';
import { toast } from 'sonner';
import {
  useGetSellerProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../../../store/slices/marketplace/marketplaceApi';
import type { Product, CreateProductPayload, UpdateProductPayload } from '../../../store/slices/marketplace/types';
import SellerDashboardNav from '../../../components/marketplace/SellerDashboardNav';
import PaginationControls from '../../../components/marketplace/PaginationControls';

// ─── Create / Edit modal ────────────────────────────────────────────────────

interface ProductFormProps {
  initial?: Product;
  onClose: () => void;
}

function ProductFormModal({ initial, onClose }: ProductFormProps) {
  const isEdit = Boolean(initial);

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    price: String(initial?.price ?? ''),
    currency: initial?.currency ?? 'USD',
    quantity: String(initial?.quantity ?? ''),
    images: initial?.images?.join(', ') ?? '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.price || !form.quantity) {
      toast.error('Title, price, and quantity are required.');
      return;
    }

    try {
      if (isEdit && initial) {
        const body: UpdateProductPayload = {
          price: parseFloat(form.price),
          quantity: parseInt(form.quantity, 10),
        };
        await updateProduct({ productId: initial.id, body }).unwrap();
        toast.success('Product updated!');
      } else {
        const body: CreateProductPayload = {
          title: form.title.trim(),
          description: form.description.trim(),
          price: parseFloat(form.price),
          currency: form.currency.trim() || 'USD',
          quantity: parseInt(form.quantity, 10),
          images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
        };
        await createProduct(body).unwrap();
        toast.success('Product created!');
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Operation failed. Please try again.');
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl text-sm ' +
    'bg-white dark:bg-neutral-b-700 ' +
    'border border-neutral-b-200 dark:border-neutral-b-600 ' +
    'text-neutral-b-900 dark:text-dark-text-primary ' +
    'placeholder-neutral-b-400 ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ' +
    'transition-all';

  const isBusy = isCreating || isUpdating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-b-800 rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-neutral-b-900 dark:text-dark-text-primary">
            {isEdit ? 'Edit Product' : 'New Product'}
          </h3>
          <button onClick={onClose} className="text-neutral-b-500 hover:text-neutral-b-800 dark:text-dark-text-muted dark:hover:text-dark-text-primary transition-colors">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="Product title" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass + ' resize-none'}
                  placeholder="Product description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary mb-1.5">
                    Currency
                  </label>
                  <input name="currency" value={form.currency} onChange={handleChange} className={inputClass} placeholder="USD" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary mb-1.5">
                  Image URLs <span className="text-neutral-b-400 font-normal">(comma-separated)</span>
                </label>
                <input name="images" value={form.images} onChange={handleChange} className={inputClass} placeholder="https://..." />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary mb-1.5">
                Price <span className="text-red-500">*</span>
              </label>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} className={inputClass} placeholder="0.00" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary mb-1.5">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input name="quantity" type="number" min="0" step="1" value={form.quantity} onChange={handleChange} className={inputClass} placeholder="0" required />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-b-200 dark:border-neutral-b-600 text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary hover:bg-neutral-b-50 dark:hover:bg-neutral-b-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isBusy ? 'Saving…' : isEdit ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

function SellerProductsPage() {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useGetSellerProductsQuery({ page, limit: 20 });
  const [deleteProduct] = useDeleteProductMutation();

  const products = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    setDeletingId(productId);
    try {
      await deleteProduct(productId).unwrap();
      toast.success('Product deleted.');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-neutral-b-900 dark:text-dark-text-primary mb-6">
          Seller Portal
        </h1>

        <SellerDashboardNav />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-b-900 dark:text-dark-text-primary">
            My Products
            {data?.total != null && (
              <span className="ml-2 text-sm font-normal text-neutral-b-500 dark:text-dark-text-muted">
                ({data.total})
              </span>
            )}
          </h2>
          <button
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
          >
            + New Product
          </button>
        </div>

        {isLoading && (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-b-100 dark:bg-neutral-b-800 rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <div className="text-center py-12 text-neutral-b-500 dark:text-dark-text-muted text-sm">
            You haven't added any products yet.
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 bg-white dark:bg-neutral-b-800
                  border border-neutral-b-200 dark:border-neutral-b-700 rounded-2xl p-4 shadow-sm"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-neutral-b-100 dark:bg-neutral-b-700">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-b-400 text-xl">📦</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-b-900 dark:text-dark-text-primary text-sm truncate">
                    {product.title}
                  </p>
                  <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted">
                    {product.currency} {product.price.toFixed(2)} · Qty: {product.quantity}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => { setEditing(product); setShowModal(true); }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg
                      border border-neutral-b-200 dark:border-neutral-b-600
                      text-neutral-b-700 dark:text-dark-text-secondary
                      hover:bg-neutral-b-50 dark:hover:bg-neutral-b-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg
                      border border-red-200 dark:border-red-900
                      text-red-600 dark:text-red-400
                      hover:bg-red-50 dark:hover:bg-red-950 transition-colors
                      disabled:opacity-50"
                  >
                    {deletingId === product.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showModal && (
        <ProductFormModal
          initial={editing ?? undefined}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

export default SellerProductsPage;
