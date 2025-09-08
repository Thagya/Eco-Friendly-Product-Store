import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../services/productService';
import { authService } from '../services/authService';

// ------------------------------
// ADMIN THUNKS (pass token)
// ------------------------------
export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const user = authService.getUserFromToken();
      if (!user) throw new Error('Admin access required');
      const response = await productService.addProduct(productData, user.token);
      return response.product;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const user = authService.getUserFromToken();
      if (!user) throw new Error('Admin access required');
      const response = await productService.updateProduct(id, data, user.token);
      return response.product;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const user = authService.getUserFromToken();
      if (!user) throw new Error('Admin access required');
      await productService.deleteProduct(id, user.token);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete product');
    }
  }
);

// ------------------------------
// PUBLIC THUNKS
// ------------------------------
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts', 
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching products from API...');
      const response = await productService.getProducts();
      console.log('Products fetched:', response);
      return response.products || response; // Handle different response formats
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById', 
  async (id, { rejectWithValue }) => {
    try {
      console.log('Fetching product by ID:', id);
      const response = await productService.getProductById(id);
      console.log('Product fetched:', response);
      return response.product || response; // Handle different response formats
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return rejectWithValue(error.message || 'Failed to fetch product');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (query, { rejectWithValue }) => {
    try {
      const response = await productService.searchProducts(query);
      return response.products || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to search products');
    }
  }
);

// ------------------------------
// SLICE
// ------------------------------
const initialState = {
  products: [],
  filteredProducts: [],
  currentProduct: null,
  categories: ['All'],
  selectedCategory: 'All',
  searchTerm: '',
  isLoading: false,
  error: null,
  status: 'idle', // idle, loading, succeeded, failed
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.filteredProducts = filterProducts(state.products, action.payload, state.selectedCategory);
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.filteredProducts = filterProducts(state.products, state.searchTerm, action.payload);
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetProducts: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = 'succeeded';
        state.products = Array.isArray(action.payload) ? action.payload : [];
        state.filteredProducts = filterProducts(state.products, state.searchTerm, state.selectedCategory);
        state.categories = ['All', ...new Set(state.products.map(p => p.category).filter(Boolean))];
        console.log('Products stored in state:', state.products.length, 'products');
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.status = 'failed';
        state.error = action.payload;
        state.products = [];
        state.filteredProducts = [];
      })

      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
        console.log('Current product set:', action.payload);
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.currentProduct = null;
      })

      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filteredProducts = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Add product
      .addCase(addProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.products.push(action.payload);
          state.filteredProducts = filterProducts(state.products, state.searchTerm, state.selectedCategory);
          // Update categories if new category added
          if (action.payload.category && !state.categories.includes(action.payload.category)) {
            state.categories.push(action.payload.category);
          }
        }
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const index = state.products.findIndex(p => p._id === action.payload._id);
          if (index !== -1) {
            state.products[index] = action.payload;
            state.filteredProducts = filterProducts(state.products, state.searchTerm, state.selectedCategory);
          }
          // Update current product if it's the same
          if (state.currentProduct && state.currentProduct._id === action.payload._id) {
            state.currentProduct = action.payload;
          }
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const productId = action.payload;
        state.products = state.products.filter(p => p._id !== productId);
        state.filteredProducts = filterProducts(state.products, state.searchTerm, state.selectedCategory);
        // Clear current product if it was deleted
        if (state.currentProduct && state.currentProduct._id === productId) {
          state.currentProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Helper function to filter products
const filterProducts = (products, searchTerm, selectedCategory) => {
  if (!Array.isArray(products)) return [];
  
  let filtered = products;

  // Filter by category
  if (selectedCategory && selectedCategory !== 'All') {
    filtered = filtered.filter(product => 
      product.category === selectedCategory
    );
  }

  // Filter by search term
  if (searchTerm && searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase().trim();
    filtered = filtered.filter(product => 
      product.name?.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};

export const { 
  setSearchTerm, 
  setSelectedCategory, 
  clearCurrentProduct, 
  clearError, 
  resetProducts 
} = productsSlice.actions;

// Selectors
export const selectAllProducts = (state) => state.products.products;
export const selectFilteredProducts = (state) => state.products.filteredProducts;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectProductsLoading = (state) => state.products.isLoading;
export const selectProductsError = (state) => state.products.error;
export const selectProductsStatus = (state) => state.products.status;
export const selectCategories = (state) => state.products.categories;
export const selectSelectedCategory = (state) => state.products.selectedCategory;
export const selectSearchTerm = (state) => state.products.searchTerm;

export default productsSlice.reducer;