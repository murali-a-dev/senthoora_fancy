import { useState, useEffect, useRef } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Upload,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Link as LinkIcon,
  Layers,
} from 'lucide-react';
import { inventoryApi, uploadApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useCompany } from '../../context/CompanyContext';
import Modal from '../../components/common/Modal';
import ImageWithFallback from '../../components/common/ImageWithFallback';

/**
 * Compresses an image file on an HTML5 canvas before encoding as base64.
 * Downscales images exceeding 1200px and optimizes quality to ~250KB.
 */
const compressImage = (file, maxDimension = 1200, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file (PNG, JPG, WEBP).'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target.result);
        }

        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(mimeType, quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export default function AdminInventory() {
  const { companyDetails } = useCompany();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { showSuccess, showError, confirm } = useToast();
  const fileInputRef = useRef(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [photoInputMode, setPhotoInputMode] = useState('upload'); // 'upload' | 'url'
  const [formData, setFormData] = useState({
    name: '',
    rate: '',
    category: 'bangles',
    description: '',
    badge: '',
    featured: false,
    stockStatus: 'In Showroom',
    tags: '',
  });

  // Image Upload State
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadedPublicId, setUploadedPublicId] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Fetch Inventory from Firebase
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getAll();
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        showError('Failed to fetch inventory from Firebase.');
      }
    } catch (err) {
      console.error('Fetch inventory error:', err);
      showError(err.message || 'Error connecting to database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setPhotoInputMode('upload');
    setFormData({
      name: '',
      rate: '',
      category: 'bangles',
      description: '',
      badge: '',
      featured: false,
      stockStatus: 'In Showroom',
      tags: '',
    });
    setImagePreview(null);
    setUploadedUrl('');
    setUploadedPublicId('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    const existingPhoto = item.photo || item.image || '';
    setPhotoInputMode(existingPhoto.startsWith('http') && !item.imageId ? 'url' : 'upload');
    setFormData({
      name: item.name || '',
      rate: item.rate !== undefined ? item.rate : '',
      category: item.category || 'bangles',
      description: item.description || '',
      badge: item.badge || '',
      featured: Boolean(item.featured),
      stockStatus: item.stockStatus || 'In Showroom',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
    });
    setImagePreview(existingPhoto);
    setUploadedUrl(existingPhoto);
    setUploadedPublicId(item.imageId || '');
    setIsModalOpen(true);
  };

  // Handle File Selection and Compression
  const handleFileChange = async (file) => {
    if (!file) return;

    try {
      setUploadingImage(true);
      // 1. Compress image to Base64
      const compressedDataUri = await compressImage(file);
      setImagePreview(compressedDataUri);

      // 2. Direct upload to Cloudinary via backend API
      const res = await uploadApi.uploadBase64(compressedDataUri);
      if (res.success && res.url) {
        setUploadedUrl(res.url);
        setUploadedPublicId(res.public_id || '');
        showSuccess('Product photo successfully uploaded to Cloudinary!');
      } else {
        showError(res.message || 'Cloudinary upload failed.');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      showError(err.message || 'Failed to process and upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Drag and drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Handle Form Submission (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showError('Please enter the product name.');
      return;
    }

    const finalPhoto = uploadedUrl || imagePreview;
    if (!finalPhoto) {
      showError('Please select an image file to upload or enter an image URL.');
      return;
    }

    if (formData.rate === '' || isNaN(Number(formData.rate))) {
      showError('Please enter a valid showcase rate (number).');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        photo: finalPhoto,
        image: finalPhoto,
        imageId: uploadedPublicId || null,
        rate: Number(formData.rate),
        category: formData.category,
        description: formData.description.trim(),
        badge: formData.badge.trim(),
        featured: Boolean(formData.featured),
        stockStatus: formData.stockStatus,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editingItem) {
        // Update in Firebase
        const res = await inventoryApi.update(editingItem.id, payload);
        if (res.success) {
          showSuccess(`Product "${payload.name}" updated successfully!`);
          setIsModalOpen(false);
          fetchInventory();
        } else {
          showError(res.message || 'Failed to update product.');
        }
      } else {
        // Create in Firebase
        const res = await inventoryApi.create(payload);
        if (res.success) {
          showSuccess(`Product "${payload.name}" added to Firebase inventory!`);
          setIsModalOpen(false);
          fetchInventory();
        } else {
          showError(res.message || 'Failed to create product.');
        }
      }
    } catch (err) {
      console.error('Save inventory error:', err);
      showError(err.message || 'Error saving product to Firebase.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Item with Confirmation Dialog
  const handleDeleteItem = (item) => {
    confirm({
      title: 'Delete Inventory Item',
      message: `Are you sure you want to permanently remove "${item.name}" from Firebase and Cloudinary? This action cannot be undone.`,
      confirmText: 'Delete Product',
      cancelText: 'Cancel',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await inventoryApi.delete(item.id);
          if (res.success) {
            showSuccess(`"${item.name}" was removed from inventory.`);
            setItems((prev) => prev.filter((i) => i.id !== item.id));
          } else {
            showError(res.message || 'Failed to delete item.');
          }
        } catch (err) {
          showError('Delete failed: ' + err.message);
        }
      },
    });
  };

  // Filtered List
  const filteredItems = items.filter((item) => {
    const matchesCat =
      selectedCategory === 'all' ||
      (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.badge && item.badge.toLowerCase().includes(query));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Inventory Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 m-0">
              Inventory Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Add, update, and manage showcase products with Cloudinary image hosting and Firebase database storage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            className="p-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer transition-colors shadow-2xs"
            title="Refresh inventory from Firebase"
            aria-label="Refresh inventory from Firebase"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/25 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="inventorySearchInput"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, description..."
            aria-label="Search inventory items"
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {companyDetails.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory.toLowerCase() === cat.id.toLowerCase()
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items Grid */}
      {loading ? (
        <div className="p-16 text-center text-stone-400 text-sm">
          <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading inventory records from Firebase...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 space-y-3">
          <Boxes className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
            No Inventory Items Found
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
            {searchQuery
              ? `No items matching "${searchQuery}". Try clearing search filters.`
              : 'Get started by adding your first product to Sri Senthoora Fancy Store showcase.'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-sm"
          >
            Add New Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white dark:bg-stone-900 border border-rose-100/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo Preview Container with ImageWithFallback */}
                <div className="relative aspect-4/3 bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <ImageWithFallback
                    src={item.photo || item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                      {item.badge}
                    </span>
                  )}
                  {item.featured && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-900 shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 line-clamp-1 m-0">
                    {item.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 m-0">
                    {item.description || 'Showcase product'}
                  </p>
                </div>
              </div>

              {/* Bottom Strip: Rate and Actions */}
              <div className="p-4 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-semibold">
                    Showcase Rate
                  </span>
                  <span className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                    {item.rateDisplay || `₹${Number(item.rate || 0).toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    title={`Edit ${item.name}`}
                    aria-label={`Edit ${item.name}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item)}
                    className="p-2 rounded-xl text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title={`Delete ${item.name}`}
                    aria-label={`Delete ${item.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accessible Add / Edit Inventory Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        subtitle="Manage product name, Cloudinary photo, and showcase rate in Firebase."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Name */}
          <div>
            <label
              htmlFor="productNameInput"
              className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1"
            >
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="productNameInput"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Royal Rajwadi Bridal Chuda Bangle Set"
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500"
            />
          </div>

          {/* Photo Input Mode: Upload vs Direct URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="productImageUpload"
                className="text-xs font-bold text-stone-700 dark:text-stone-300"
              >
                Product Photo <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setPhotoInputMode('upload')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    photoInputMode === 'upload'
                      ? 'bg-white dark:bg-stone-700 text-rose-600 dark:text-rose-400 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  <Upload className="w-3 h-3 inline mr-1" />
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoInputMode('url')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    photoInputMode === 'url'
                      ? 'bg-white dark:bg-stone-700 text-rose-600 dark:text-rose-400 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  <LinkIcon className="w-3 h-3 inline mr-1" />
                  Image URL
                </button>
              </div>
            </div>

            {photoInputMode === 'upload' ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px] ${
                  isDraggingOver
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
                    : 'border-stone-200 dark:border-stone-700 hover:border-rose-400 bg-stone-50/50 dark:bg-stone-800/40'
                }`}
              >
                <input
                  id="productImageUpload"
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />

                {uploadingImage ? (
                  <div className="space-y-2">
                    <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <span className="text-xs font-semibold text-rose-600">
                      Optimizing & uploading to Cloudinary...
                    </span>
                  </div>
                ) : imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="h-28 w-auto max-w-full object-contain rounded-xl mx-auto border border-stone-200 dark:border-stone-700 shadow-xs"
                    />
                    <span className="text-[11px] text-stone-500 block">
                      Click or drag new image to replace
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-stone-700 flex items-center justify-center text-rose-500 mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                        Click to select or drag and drop image
                      </span>
                      <span className="text-[10px] text-stone-500 block mt-0.5">
                        Downscaled automatically and stored on Cloudinary
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="url"
                  value={uploadedUrl}
                  onChange={(e) => {
                    setUploadedUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://example.com/images/product.jpg"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500"
                />
                {uploadedUrl && (
                  <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-3">
                    <img
                      src={uploadedUrl}
                      alt="URL preview"
                      className="w-14 h-14 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = companyDetails.logo;
                      }}
                    />
                    <span className="text-[11px] text-stone-500 truncate">{uploadedUrl}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rate & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="productRateInput"
                className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1"
              >
                Display Rate (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                id="productRateInput"
                type="number"
                required
                min="0"
                step="1"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                placeholder="e.g. 1850"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500"
              />
              <span className="text-[10px] text-stone-500 block mt-0.5">
                Showcase reference rate only (no online purchase)
              </span>
            </div>

            <div>
              <label
                htmlFor="productCategorySelect"
                className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1"
              >
                Showcase Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="productCategorySelect"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500 capitalize"
              >
                {companyDetails.categories
                  .filter((c) => c.id !== 'all')
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="productDescriptionInput"
              className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1"
            >
              Product Description
            </label>
            <textarea
              id="productDescriptionInput"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Materials, design details, sizes available in showroom..."
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500 resize-none"
            ></textarea>
          </div>

          {/* Badges & Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label
                htmlFor="productBadgeInput"
                className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1"
              >
                Badge (Optional)
              </label>
              <input
                id="productBadgeInput"
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. Bridal Special, Bestseller, New"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:border-rose-500"
              />
            </div>

            <div className="pt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="featuredCheckbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded-md border-stone-300 focus:ring-rose-500 cursor-pointer"
              />
              <label
                htmlFor="featuredCheckbox"
                className="text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer"
              >
                Feature this product on Home page
              </label>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                {saving
                  ? 'Saving to Firebase...'
                  : editingItem
                  ? 'Update Product'
                  : 'Add to Inventory'}
              </span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
