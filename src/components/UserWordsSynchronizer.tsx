import { useAuth } from "@/components/AuthProvider";
import { useUserWordsSync } from "@/hooks/use-words";

/**
 * This is a background component. Its only job is to trigger the word sync
 * when the user is logged in. It renders nothing to the screen.
 */
export const UserWordsSynchronizer = () => {
  // Get the signed-in user's details
  const { user } = useAuth();

  // Trigger the hook with the user's ID.
  // The hook will automatically run when the user.id becomes available.
  useUserWordsSync(user?.id);

  // This component renders nothing.
  return null;
};
