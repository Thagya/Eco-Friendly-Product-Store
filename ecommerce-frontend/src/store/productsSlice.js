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
export const fetchProducts = createAsyncThunk('products/fetchProducts', async (_, { rejectWithValue }) => {
  try {
    const response = await productService.getProducts();
    return response;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch products');
  }
});

export const fetchProductById = createAsyncThunk('products/fetchProductById', async (id, { rejectWithValue }) => {
  try {
    const response = await productService.getProductById(id);
    return response;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch product');
  }
});

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
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => { state.searchTerm = action.payload; },
    setSelectedCategory: (state, action) => { state.selectedCategory = action.payload; },
    clearCurrentProduct: (state) => { state.currentProduct = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
        state.filteredProducts = action.payload;
        state.categories = ['All', ...new Set(action.payload.map(p => p.category))];
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      // Add product
      .addCase(addProduct.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.push(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.products[index] = action.payload;
      })

      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p._id !== action.payload);
      });
  },
});

export const { setSearchTerm, setSelectedCategory, clearCurrentProduct, clearError } = productsSlice.actions;
export default productsSlice.reducer;
