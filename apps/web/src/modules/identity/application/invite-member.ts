export type MemberInvitationInput = {
  displayName: string;
  email: string;
  reauthenticationTokenHash: string;
  requestId: string;
};

export interface AdminMemberInvitationDirectory {
  create(email: string): Promise<string>;
  find(email: string): Promise<string | null>;
  queue(input: {
    displayName: string;
    memberId: string;
    reauthenticationTokenHash: string;
    requestId: string;
  }): Promise<void>;
  remove(memberId: string): Promise<void>;
}

export async function inviteMember(
  input: MemberInvitationInput,
  directory: AdminMemberInvitationDirectory,
) {
  const email = input.email.trim().toLowerCase();
  const existing = await directory.find(email);
  const memberId = existing ?? (await directory.create(email));
  try {
    await directory.queue({
      displayName: input.displayName.trim(),
      memberId,
      reauthenticationTokenHash: input.reauthenticationTokenHash,
      requestId: input.requestId,
    });
  } catch (error) {
    if (!existing) {
      await directory.remove(memberId);
    }
    throw error;
  }
  return { created: !existing, memberId };
}
