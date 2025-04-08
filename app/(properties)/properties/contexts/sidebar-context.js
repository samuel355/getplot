"use client";

import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext({
  isMobileOpen: false,
  setIsMobileOpen: () => {},
});

export function SidebarProvider({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  return (
    <SidebarContext.Provider value={{ isMobileOpen, setIsMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}