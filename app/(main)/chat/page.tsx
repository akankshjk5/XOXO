import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ChatClient } from "@/components/chat/ChatClient";

export const metadata = {
  title: "Messages | XOXO Travels",
};

export default function ChatPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<div className="pt-32 text-center text-text-grey">Loading…</div>}>
        <ChatClient />
      </Suspense>
    </RequireAuth>
  );
}
