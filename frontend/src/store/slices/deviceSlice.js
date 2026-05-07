import { createSlice } from '@reduxjs/toolkit'

const deviceSlice = createSlice({
  name: 'devices',
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    setDevices: (state, action) => {
      state.list = action.payload
    },
    setSelectedDevice: (state, action) => {
      state.selected = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setDevices, setSelectedDevice, setLoading, setError } = deviceSlice.actions
export default deviceSlice.reducer
