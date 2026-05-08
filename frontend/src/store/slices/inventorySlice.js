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
    addDevice: (state, action) => {
      const { inventoryId, device } = action.payload
      const item = state.items.find((i) => i.id === inventoryId)
      if (item) {
        if (!item.devices) item.devices = []
        item.devices.push(device)
      }
    },
    updateDevice: (state, action) => {
      const { inventoryId, device } = action.payload
      const item = state.items.find((i) => i.id === inventoryId)
      if (item && item.devices) {
        const idx = item.devices.findIndex((d) => d.id === device.id)
        if (idx !== -1) item.devices[idx] = device
      }
    },
    removeDevice: (state, action) => {
      const { inventoryId, deviceId } = action.payload
      const item = state.items.find((i) => i.id === inventoryId)
      if (item && item.devices) {
        item.devices = item.devices.filter((d) => d.id !== deviceId)
      }
    },
    setItems: (state, action) => {
      state.items = action.payload
    },
  },
})

export const { addItem, updateItem, removeItem, addDevice, updateDevice, removeDevice, setItems } = inventorySlice.actions
export default inventorySlice.reducer
