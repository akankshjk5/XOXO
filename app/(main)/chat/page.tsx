import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ChatClient } from "@/components/chat/ChatClient";
import { LoadingSkeleton } from "@/components/motion";

export const metadata = {
  title: "Messages",
};

function ChatFallback() {
  return (
    <div className="pt-[88px] container-x pb-16">
      <LoadingSkeleton className="h-10 w-48 rounded-lg mb-6" />
      <LoadingSkeleton className="h-[70vh] rounded-2xl" />
    </div>
  );
}

export default function ChatPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<ChatFallback />}>
        <ChatClient />
      </Suspense>
    </RequireAuth>
  );
}
