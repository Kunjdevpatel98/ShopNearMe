import { useState, useEffect } from 'react';

const ShopForm = ({ initialData, categories, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '', description: '', address: '', city: '', latitude: '', longitude: '', phone: '', isOpen: true, categoryId: categories[0]?.id || '',
        imageUrl: '', openingTime: '', closingTime: '', isClosedOnSunday: false, offers: '', services: '', tags: '', isVisible: true,
        communicationMode: 'BOTH'
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
        // Convert numeric fields
        const payload = {
            ...formData,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude)
        };
        onSave(payload);
    };

    return (
        <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-lg font-bold mb-4">{initialData ? 'Edit Shop' : 'Add New Shop'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="border p-2 rounded" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
                <input className="border p-2 rounded" name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
                <input className="border p-2 rounded" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
                <input className="border p-2 rounded" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
                <input className="border p-2 rounded" name="latitude" type="number" step="any" placeholder="Latitude" value={formData.latitude} onChange={handleChange} required />
                <input className="border p-2 rounded" name="longitude" type="number" step="any" placeholder="Longitude" value={formData.longitude} onChange={handleChange} required />
                <input className="border p-2 rounded" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />

                <select className="border p-2 rounded" name="categoryId" value={formData.categoryId} onChange={handleChange}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                {/* New Fields */}
                <input className="border p-2 rounded md:col-span-2" name="imageUrl" placeholder="Image URL" value={formData.imageUrl || ''} onChange={handleChange} />

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs text-gray-500">Opening Time</label>
                        <input type="time" name="openingTime" className="border p-2 rounded w-full" value={formData.openingTime || ''} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500">Closing Time</label>
                        <input type="time" name="closingTime" className="border p-2 rounded w-full" value={formData.closingTime || ''} onChange={handleChange} />
                    </div>
                </div>

                <div className="flex items-center">
                    <input type="checkbox" name="isClosedOnSunday" checked={formData.isClosedOnSunday || false} onChange={handleChange} className="mr-2" />
                    <label>Closed on Sunday</label>
                </div>

                <div>
                    <label className="block text-xs text-gray-500 mb-1">Communication Preference</label>
                    <select className="border p-2 rounded w-full" name="communicationMode" value={formData.communicationMode || 'BOTH'} onChange={handleChange}>
                        <option value="BOTH">Both (Call & WhatsApp AI)</option>
                        <option value="CALL">Call Only</option>
                        <option value="WHATSAPP">WhatsApp AI Only</option>
                    </select>
                </div>

                <input className="border p-2 rounded" name="offers" placeholder="Offers (e.g. 10% off)" value={formData.offers || ''} onChange={handleChange} />
                <input className="border p-2 rounded" name="services" placeholder="Services (comma separated)" value={formData.services || ''} onChange={handleChange} />
                <input className="border p-2 rounded" name="tags" placeholder="Tags (comma separated)" value={formData.tags || ''} onChange={handleChange} />

                <div className="flex items-center">
                    <input type="checkbox" name="isVisible" checked={formData.isVisible !== false} onChange={handleChange} className="mr-2" />
                    <label>Visible to Public</label>
                </div>

                <div className="md:col-span-2 flex justify-end space-x-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                </div>
            </form>
        </div>
    );
};

export default ShopForm;
