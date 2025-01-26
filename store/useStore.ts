import { create } from 'zustand';

interface UserState {
  credits: number;
  setCredits: (credits: number) => void;
  updateCredits: (amount: number) => void;
}

export const useStore = create<UserState>((set) => ({
  credits: 0,
  setCredits: (credits) => set({ credits }),
  updateCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
})); 