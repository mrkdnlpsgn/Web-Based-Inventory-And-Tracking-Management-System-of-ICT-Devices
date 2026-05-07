import { createSlice } from '@reduxjs/toolkit'

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    items: [],
  },
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload)
    },
    updateItem: (state, action) => {
      const idx = state.items.findIndex((i) => i.id === action.payload.id)
      if (idx !== -1) state.items[idx] = action.payload
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload)
    },
  },
})

export const { addItem, updateItem, removeItem } = inventorySlice.actions
export default inventorySlice.reducer
