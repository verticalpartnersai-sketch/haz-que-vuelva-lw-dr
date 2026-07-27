"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { AccessState, UserRole } from "@/mocks/types";

type MockSession = {
  role: UserRole;
  roleLocked: boolean;
  setRole: (role: UserRole) => void;
  aiAccess: AccessState;
  aiAccessLocked: boolean;
  setAiAccess: (state: AccessState) => void;
};

const MockSessionContext = createContext<MockSession | null>(null);

export function MockSessionProvider({
  children,
  initialRole = "member",
  roleLocked = false,
  initialAiAccess = "available",
  aiAccessLocked = false,
}: {
  children: ReactNode;
  initialRole?: UserRole;
  roleLocked?: boolean;
  initialAiAccess?: AccessState;
  aiAccessLocked?: boolean;
}) {
  const [role, updateRole] = useState<UserRole>(initialRole);
  const [aiAccess, updateAiAccess] = useState<AccessState>(initialAiAccess);
  const setRole = useCallback((nextRole: UserRole) => {
    if (!roleLocked) updateRole(nextRole);
  }, [roleLocked]);
  const setAiAccess = useCallback((nextAccess: AccessState) => {
    if (!aiAccessLocked) updateAiAccess(nextAccess);
  }, [aiAccessLocked]);
  const value = useMemo(
    () => ({
      role,
      roleLocked,
      setRole,
      aiAccess,
      aiAccessLocked,
      setAiAccess,
    }),
    [aiAccess, aiAccessLocked, role, roleLocked, setAiAccess, setRole],
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
