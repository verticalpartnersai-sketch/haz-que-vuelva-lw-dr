"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { AccessState, UserRole } from "@/mocks/types";

type MockSession = {
  role: UserRole;
  setRole: (role: UserRole) => void;
  aiAccess: AccessState;
  setAiAccess: (state: AccessState) => void;
};

const MockSessionContext = createContext<MockSession | null>(null);

export function MockSessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("member");
  const [aiAccess, setAiAccess] = useState<AccessState>("available");
  const value = useMemo(
    () => ({ role, setRole, aiAccess, setAiAccess }),
    [aiAccess, role],
  );

  return (
    <MockSessionContext.Provider value={value}>
      {children}
    </MockSessionContext.Provider>
  );
}

export function useMockSession() {
  const session = useContext(MockSessionContext);
  if (!session) {
    throw new Error("useMockSession debe usarse dentro de MockSessionProvider");
  }
  return session;
}
