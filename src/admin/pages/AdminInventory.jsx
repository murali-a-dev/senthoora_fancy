import { useState, useEffect, useRef } from 'react';
import {
  Boxes, Plus, Search, Upload, Edit2, Trash2,
  Check, Sparkles, RefreshCw, Link as LinkIcon,
} from 'lucide-react';
import { inventoryApi, uploadApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useCompany } from '../../context/CompanyContext';
import Modal from '../../components/common/Modal';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import ProductSkeletonCard from '../../components/common/ProductSkeletonCard';
// ✅ FIX: Import shared utility — removes the local duplicate compressImage function
import { compressImage } from '../../utils/imageUtils';

const STOCK_OPTIONS = ['In Showroom', 'Limited Stock', 'Display Only', 'Available on Order'];

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] placeholder-[var(--color-text-light)] focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-surface)] outline-none transition-all';

export default function AdminInventory() {
  const { companyDetails } = useCompany();
  const { showSuccess, showError, confirm } = useToast();
  const fileInputRef = useRef(null);

  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchQuery, setSearch]    = useState('');
  const [selectedCat, setCat]       = useState('all');
  const [isModalOpen, setModal]     = useState(false);
  const [editingItem, setEditing]   = useState(null);
  const [photoMode, setPhotoMode]   = useState('upload');
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [dragging, setDragging]     = useState(false);
  const [imagePreview, setPreview]  = useState(null);
  const [uploadedUrl, setUUrl]      = useState('');
  const [uploadedId, setUID]        = useState('');
  // ✅ FIX: Per-item delete loading state — prevents double-click on delete
  const [deleting, setDeleting]     = useState({});

  const [form, setForm] = useState({
    name: '', rate: '', rateDisplay: '', category: 'bangles',
    description: '', badge: '', featured: false,
    stockStatus: 'In Showroom', tags: '',
  });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getAll();
      if (res.success && Array.isArray(res.data)) setItems(res.data);
      else showError('Failed to fetch inventory from Firebase.');
    } catch (err) {
      showError(err.message || 'Error connecting to database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const openAdd = () => {
    setEditing(null);
    setPhotoMode('upload');
    setForm({
      name: '', rate: '', rateDisplay: '',
      category: companyDetails.categories.filter((c) => c.id !== 'all')[0]?.id || 'bangles',
      description: '', badge: '', featured: false, stockStatus: 'In Showroom', tags: '',
    });
    setPreview(null); setUUrl(''); setUID(''); setModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    const ph = item.photo || item.image || '';
    setPhotoMode(ph.startsWith('http') && !item.imageId ? 'url' : 'upload');
    setForm({
      name: item.name || '', rate: item.rate ?? '', rateDisplay: item.rateDisplay || '',
      category: item.category || 'bangles', description: item.description || '',
      badge: item.badge || '', featured: Boolean(item.featured),
      stockStatus: item.stockStatus || 'In Showroom',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
    });
    setPreview(ph); setUUrl(ph); setUID(item.imageId || ''); setModal(true);
  };

  // ✅ FIX: handleFile now uses the shared compressImage which enforces a 20 MB max
  // before attempting to read the file — prevents freezing on huge RAW photos
  const handleFile = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      // compressImage from imageUtils will throw if file > 20 MB
      const uri = await compressImage(file);
      setPreview(uri);
      const res = await uploadApi.uploadBase64(uri);
      if (res.success && res.url) {
        setUUrl(res.url); setUID(res.public_id || '');
        showSuccess('Photo uploaded to Cloudinary!');
      } else {
        showError(res.message || 'Upload failed.');
      }
    } catch (err) {
      showError(err.message || 'Upload error.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showError('Product name is required.'); return; }
    const finalPhoto = uploadedUrl || imagePreview;
    if (!finalPhoto) { showError('Please upload or provide a product image.'); return; }
    if (form.rate === '' || isNaN(Number(form.rate))) { showError('Please enter a valid rate number.'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(), photo: finalPhoto, image: finalPhoto,
        imageId: uploadedId || null, rate: Number(form.rate),
        rateDisplay: form.rateDisplay.trim(), category: form.category,
        description: form.description.trim(), badge: form.badge.trim(),
        featured: Boolean(form.featured), stockStatus: form.stockStatus,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      };
      const res = editingItem
        ? await inventoryApi.update(editingItem.id, payload)
        : await inventoryApi.create(payload);
      if (res.success) {
        showSuccess(editingItem ? `"${payload.name}" updated!` : `"${payload.name}" added to inventory!`);
        setModal(false); fetchInventory();
      } else {
        showError(res.message || 'Failed to save product.');
      }
    } catch (err) {
      showError(err.message || 'Save error.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    // ✅ FIX: Guard against deleting the same item twice if confirm is clicked rapidly
    if (deleting[item.id]) return;
    confirm({
      title: 'Delete Product', isDanger: true,
      message: `Permanently remove "${item.name}" from Firebase and Cloudinary?`,
      confirmText: 'Delete', cancelText: 'Cancel',
      onConfirm: async () => {
        setDeleting((p) => ({ ...p, [item.id]: true }));
        try {
          const res = await inventoryApi.delete(item.id);
          if (res.success) {
            showSuccess(`"${item.name}" removed.`);
            setItems((p) => p.filter((i) => i.id !== item.id));
          } else {
            showError(res.message || 'Failed to delete.');
          }
        } catch (err) {
          showError('Delete failed: ' + err.message);
        } finally {
          setDeleting((p) => ({ ...p, [item.id]: false }));
        }
      },
    });
  };

  const filtered = items.filter((item) => {
    const catOk = selectedCat === 'all' || (item.category || '').toLowerCase() === selectedCat.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const queryOk = !q || (item.name || '').toLowerCase().includes(q) || (item.description || '').toLowerCase().includes(q) || (item.badge || '').toLowerCase().includes(q);
    return catOk && queryOk;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-primary)]" />
            <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text-main)] m-0">
              Inventory Management
            </h1>
          </div>
          <p className="text-xs text-[var(--color-text-light)] mt-1">
            Add, update, and manage showcase products. Live Cloudinary &amp; Firebase sync.
          </p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
          <button
            onClick={fetchInventory} title="Refresh" aria-label="Refresh inventory"
            className="p-2.5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-light)] hover:text-[var(--color-text-main)] cursor-pointer transition-colors shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button" onClick={openAdd}
            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-md shadow-[var(--color-primary)]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />Add New Product
          </button>
        </div>
      </div>

      {/* Search + Category Filter */}
      <div className="p-3.5 sm:p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-sm flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[var(--color-text-light)] absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text" value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, description…" aria-label="Search inventory"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] placeholder-[var(--color-text-light)] focus:border-[var(--color-primary)] outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full py-1">
          {(companyDetails.categories || []).map((cat) => (
            <button
              key={cat.id} type="button" onClick={() => setCat(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCat.toLowerCase() === cat.id.toLowerCase()
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-muted)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div aria-live="polite" className="text-xs text-[var(--color-text-light)] px-1">
        Showing <strong className="text-[var(--color-text-main)]">{filtered.length}</strong> of {items.length} items
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <ProductSkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] space-y-4">
          <Boxes className="w-10 h-10 text-[var(--color-text-light)] mx-auto opacity-40" />
          <h3 className="font-serif text-lg font-bold text-[var(--color-text-main)] m-0">
            {searchQuery ? 'No matches found' : 'No Products Yet'}
          </h3>
          <p className="text-xs text-[var(--color-text-light)] max-w-sm mx-auto">
            {searchQuery ? `Clear the search to see all ${items.length} items.` : 'Add your first showcase product to get started.'}
          </p>
          {!searchQuery && (
            <button onClick={openAdd} className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] cursor-pointer">
              Add First Product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((item) => (
            <div key={item.id} className="group flex flex-col bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-[var(--color-card-shadow)] hover:shadow-md transition-all">
              <div className="relative aspect-4/3 bg-[var(--color-bg-subtle)] overflow-hidden">
                <ImageWithFallback src={item.photo || item.image} alt={item.name} aspectRatioClass="aspect-4/3" className="group-hover:scale-105 transition-transform duration-300" />
                {item.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-primary)] text-white">{item.badge}</span>
                )}
                {item.featured && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-accent-gold-light)] text-[var(--color-accent-gold)] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />Featured
                  </span>
                )}
              </div>
              <div className="flex-1 p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] block capitalize">{item.category}</span>
                <h3 className="font-serif text-sm font-bold text-[var(--color-text-main)] line-clamp-1 m-0">{item.name}</h3>
                <p className="text-[11px] text-[var(--color-text-light)] line-clamp-2">{item.description || '—'}</p>
              </div>
              <div className="px-4 pb-4 pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-text-light)] block">Rate</span>
                  <span className="font-serif text-sm font-bold text-[var(--color-text-main)]">
                    {item.rateDisplay || `₹${Number(item.rate || 0).toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button" onClick={() => openEdit(item)} aria-label={`Edit ${item.name}`}
                    className="p-2 rounded-xl text-[var(--color-text-light)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {/* ✅ FIX: Delete button shows spinner while deletion is in progress */}
                  <button
                    type="button" onClick={() => handleDelete(item)} aria-label={`Delete ${item.name}`}
                    disabled={deleting[item.id]}
                    className="p-2 rounded-xl text-[var(--color-primary)]/60 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deleting[item.id]
                      ? <span className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin block" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModal(false)}
        title={editingItem ? 'Edit Product' : 'Add New Product'}
        maxWidthClass="max-w-2xl"
        ariaLabelId="inv-modal-title"
      >
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label htmlFor="inv-name" className="block text-xs font-bold text-[var(--color-text-muted)] mb-1.5">
              Product Name <span className="text-[var(--color-primary)]">*</span>
            </label>
            <input
              id="inv-name" type="text" required
              value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Royal Rajwadi Bridal Chuda Set"
              className={inputCls}
            />
          </div>

          {/* Photo upload / URL */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[var(--color-text-muted)]">
                Product Photo <span className="text-[var(--color-primary)]">*</span>
              </label>
              <div className="flex items-center gap-0.5 bg-[var(--color-bg-subtle)] p-0.5 rounded-lg text-[11px]">
                {[['upload', 'Upload'], ['url', 'URL']].map(([m, l]) => (
                  <button
                    key={m} type="button" onClick={() => setPhotoMode(m)}
                    className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-colors ${
                      photoMode === m
                        ? 'bg-[var(--color-bg-surface)] text-[var(--color-primary)] shadow-sm'
                        : 'text-[var(--color-text-light)] hover:text-[var(--color-text-main)]'
                    }`}
                  >
                    {m === 'upload' ? <><Upload className="w-3 h-3 inline mr-0.5" />{l}</> : <><LinkIcon className="w-3 h-3 inline mr-0.5" />{l}</>}
                  </button>
                ))}
              </div>
            </div>

            {photoMode === 'upload' ? (
              <div
                key="photo-mode-upload"
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center justify-center min-h-[160px] transition-all ${
                  dragging
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 bg-[var(--color-bg-subtle)]'
                }`}
              >
                <input
                  key="file-upload-input"
                  type="file" ref={fileInputRef}
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  id="inv-img-upload"
                  aria-label="Upload product image"
                />
                {uploading ? (
                  <div className="space-y-2">
                    <div className="w-8 h-8 border-[3px] border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto" />
                    <span className="text-xs font-semibold text-[var(--color-primary)]">Uploading to Cloudinary…</span>
                  </div>
                ) : imagePreview ? (
                  <div className="space-y-2">
                    <img src={imagePreview} alt="Preview" className="h-28 w-auto max-w-full object-contain rounded-xl mx-auto border border-[var(--color-border)]" />
                    <span className="text-[11px] text-[var(--color-text-light)]">Click or drag to replace</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[var(--color-text-main)] block">Click or drag image here</span>
                    {/* ✅ FIX: User-visible 20 MB limit hint */}
                    <span className="text-[10px] text-[var(--color-text-light)]">PNG, JPG, WEBP — max 20 MB — Auto-compressed → Cloudinary</span>
                  </div>
                )}
              </div>
            ) : (
              <div key="photo-mode-url" className="space-y-2">
                <input
                  key="url-image-input"
                  type="url"
                  value={uploadedUrl ?? ''}
                  onChange={(e) => { setUUrl(e.target.value); setPreview(e.target.value); }}
                  placeholder="https://…/image.jpg"
                  className={inputCls}
                />
                {uploadedUrl && (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
                    <img
                      src={uploadedUrl} alt="Preview"
                      className="w-14 h-14 object-cover rounded-lg"
                      onError={(e) => { e.target.src = companyDetails.logo; }}
                    />
                    <span className="text-[11px] text-[var(--color-text-light)] truncate">{uploadedUrl}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rate + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="inv-rate" className="block text-xs font-bold text-[var(--color-text-muted)] mb-1.5">
                Display Rate (₹) <span className="text-[var(--color-primary)]">*</span>
              </label>
              <input
                id="inv-rate" type="number" required min="0" step="1"
                value={form.rate ?? ''} onChange={(e) => setForm({ ...form, rate: e.target.value })}
                placeholder="e.g. 1850" className={inputCls}
              />
              <span className="text-[10px] text-[var(--color-text-light)] mt-0.5 block">Showroom reference rate only</span>
            </div>
            <div>
              <label htmlFor="inv-cat" className="block text-xs font-bold text-[var(--color-text-muted)] mb-1.5">
                Category <span className="text-[var(--color-primary)]">*</span>
              </label>
              <select
                id="inv-cat" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={`${inputCls} cursor-pointer capitalize`}
              >
                {(companyDetails.categories || []).filter((c) => c.id !== 'all').map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Rate Display override + Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="inv-rdisplay" className="block text-xs font-bold text-[var(--color-text-muted)] mb-1.5">
                Rate Display Override <span className="text-[var(--color-text-light)] font-normal">(optional)</span>
              </label>
              <input
                id="inv-rdisplay" type="text"
                value={form.rateDisplay ?? ''} onChange={(e) => setForm({ ...form, rateDisplay: e.target.value })}
                placeholder="e.g. ₹1,850 / Set" className={inputCls}
              />
              <span className="text-[10px] text-[var(--color-text-light)] mt-0.5 block">Overrides auto-formatted rate label</span>
            </div>
            <div>
              <label htmlFor="inv-stock" className="block text-xs font-bold text-[var(--color-text-muted)] mb-1.5">Stock Status</label>
              <select
                id="inv-stock" value={form.stockStatus ?? 'In Showroom'}
                onChange={(e) => setForm({ ...form, stockStatus: e.target.value })}
                className={`${inputCls} cursor-pointer`}
              >
                {STOCK_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="inv-desc" className="block text-xs font-bold text-[var(--color-text-muted)] mb-1.5">Description</label>
            <textarea
              id="inv-desc" rows={3}
              value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Materials, design details, sizes available…"
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Tags + Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="inv-tags" className="block text-xs font-bold text-[var(--color-text-muted)] mb-1.5">
                Tags <span className="text-[var(--color-text-light)] font-normal">(comma-separated)</span>
              </label>
              <input
                id="inv-tags" type="text"
                value={form.tags ?? ''} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="bridal, antique, gold" className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="inv-badge" className="block text-xs font-bold text-[var(--color-text-muted)] mb-1.5">
                Badge Label <span className="text-[var(--color-text-light)] font-normal">(optional)</span>
              </label>
              <input
                id="inv-badge" type="text"
                value={form.badge ?? ''} onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="e.g. Bridal Special" className={inputCls}
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox" checked={Boolean(form.featured)}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="w-4 h-4 rounded accent-[var(--color-primary)] cursor-pointer"
            />
            <span className="text-xs font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors">
              Feature this product on the Home page
            </span>
          </label>

          {/* Actions */}
          <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-end gap-3">
            <button
              type="button" onClick={() => setModal(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving || uploading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Saving…' : uploading ? 'Uploading…' : editingItem ? 'Update Product' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
