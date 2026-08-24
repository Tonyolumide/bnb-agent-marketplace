export type PermissionGrant = {
  sessionId: string;
  allowedContracts: `0x${string}`[];
  allowedFunctions: string[];
  perTransactionCap: string;
  totalSpendCap: string;
  expiresAt: Date;
  status: "active" | "expired" | "revoked";
};

export interface PermissionAdapter {
  grant(input: Omit<PermissionGrant, "sessionId" | "status">): Promise<PermissionGrant>;
  revoke(sessionId: string): Promise<void>;
}

/** Replace with Altana grantSession / revoke flow in Phase 2. */
export class MockPermissionAdapter implements PermissionAdapter {
  async grant(input: Omit<PermissionGrant, "sessionId" | "status">): Promise<PermissionGrant> {
    return { ...input, sessionId: crypto.randomUUID(), status: "active" };
  }

  async revoke(): Promise<void> {}
}

export const permissions = new MockPermissionAdapter();

