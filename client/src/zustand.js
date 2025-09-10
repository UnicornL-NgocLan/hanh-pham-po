import { create } from 'zustand'

export const useZustand = create((set) => ({
    products: [],
    partners: [],
    uoms: [],
    prs: [],
    pr_sequences: [],
    pr_lines: [],
    pos: [],
    po_lines: [],
    contracts: [],
    setProductState: (value) => set({ products: value }),
    setPartnerState: (value) => set({ partners: value }),
    setUomState: (value) => set({ uoms: value }),
    setPrState: (value) => set({ prs: value }),
    setPrSequenceState: (value) => set({ pr_sequences: value }),
    setPrLineState: (value) => set({ pr_lines: value }),
    setPoState: (value) => set({ pos: value }),
    setPoLineState: (value) => set({ po_lines: value }),
    setContractState: (value) => set({ contracts: value }),
}))
