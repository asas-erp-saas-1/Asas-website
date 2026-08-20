'use client';

import { create } from 'zustand';

interface UIState {
  compareModalOpen: boolean;
  setCompareModalOpen: (open: boolean) => void;
  searchPaletteOpen: boolean;
  setSearchPaletteOpen: (open: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  compareModalOpen: false,
  setCompareModalOpen: (open) => set({ compareModalOpen: open }),
  searchPaletteOpen: false,
  setSearchPaletteOpen: (open) => set({ searchPaletteOpen: open }),
}));
