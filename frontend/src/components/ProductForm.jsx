import { useState, useEffect } from 'react';

const ProductForm = ({ initialData, shopId, categories, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '', description: '', price: '', imageUrl: '', categoryId: categories[0]?.id || '', isAvailable: true
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                categoryId: initialData.category?.id || categories[0]?.id || ''
            });
        }
    }, [initialData, categories]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            category: categories.find(c => c.id == formData.categoryId)
        };
        onSave(payload, shopId);
    };

    return (
        <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-lg font-bold mb-4">{initialData ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input className="border p-2 rounded w-full" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required />
                <textarea className="border p-2 rounded w-full" name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
                <input className="border p-2 rounded w-full" name="price" type="number" step="0.01" placeholder="Price" value={formData.price} onChange={handleChange} required />
                <input className="border p-2 rounded w-full" name="imageUrl" placeholder="Image URL" value={formData.imageUrl || ''} onChange={handleChange} />

                <select className="border p-2 rounded w-full" name="categoryId" value={formData.categoryId} onChange={handleChange}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isAvailable"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleChange}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                        Available in Stock
                    </label>
                </div>

                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
