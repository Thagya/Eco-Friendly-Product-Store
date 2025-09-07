// src/components/products/ProductForm.jsx
import React, { useState } from "react";
import ImageUpload from "./ImageUpload";
import { Save } from "lucide-react";

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    category: product?.category || "Eco Bags",
    image: product?.image || "",
    stock: product?.stock || 0,
  });

  const categories = ["Eco Bags", "Water Bottles", "Reusable Items", "Solar Products", "Organic"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image */}
      <div>
        <label className="block text-gray-300 mb-2">Image</label>
        <ImageUpload
          value={formData.image}
          onChange={(img) => setFormData((prev) => ({ ...prev, image: img }))}
        />
      </div>

      {/* Name + Category */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-300 mb-2">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-gray-800">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Price + Stock */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-300 mb-2">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-2">Stock</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-gray-300 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-eco-green to-eco-leaf text-white font-semibold rounded-xl"
        >
          <Save className="w-5 h-5" />
          <span>{product ? "Update" : "Add"}</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-white/10 text-white rounded-xl"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
