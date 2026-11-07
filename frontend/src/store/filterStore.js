import { create } from 'zustand';

export const useFilterStore = create((set) => ({
  homeCategory: 'All',
  searchFilters: { type: 'all', sort: 'relevance', duration: 'any' },
  libraryTab: 'history',
  setHomeCategory: (homeCategory) => set({ homeCategory }),
  setSearchFilters: (searchFilters) => set({ searchFilters }),
  setLibraryTab: (libraryTab) => set({ libraryTab }),
}));
