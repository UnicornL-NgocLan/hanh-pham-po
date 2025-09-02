import { create } from 'zustand'

export const useZustand = create((set) => ({
  products: [],
  partners: [],
  uoms: [],
  setProductState: (value) => set({ products: value }),
  setPartnerState: (value) => set({ partners: value }),
  setUomState: (value) => set({ uoms: value }),
}))