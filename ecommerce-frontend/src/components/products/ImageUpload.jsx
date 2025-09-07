// src/components/products/ImageUpload.jsx
import React from 'react';

const ImageUpload = ({ value, onChange }) => {

  const handleFileChange = (e) => {
    e.preventDefault(); // Prevent form submission
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result); // Update parent state
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center space-x-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="text-white"
      />
      {value && (
        <img
          src={value}
          alt="preview"
          className="w-20 h-20 object-cover rounded-lg"
        />
      )}
    </div>
  );
};

export default ImageUpload;
