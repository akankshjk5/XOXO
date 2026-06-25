"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { friendsAPI } from "@/lib/api";
import { FriendActionButton, FriendStatusBadge } from "@/components/social/FriendActionButton";
import { VerifiedBadge } from "@/components/social/VerifiedBadge";
import { AnimatedTabs, AnimatedTabPanel } from "@/components/motion/AnimatedTabs";
import { EmptyState, LoadingSkeleton } from "@/components/motion";

interface FriendUser { _id: string; name: string; avatar?: string; isVerified?: boolean; trustScore?: number }

export function FriendsClient() {
  const [tab, setTab] = useState<"friends" | "requests">("friends");
  const [friends, setFriends] = useState<{ friendshipId: string; user: FriendUser }[]>([]);
  const [incoming, setIncoming] = useState<{ _id: string; requester: FriendUser }[]>([]);
  const [outgoing, setOutgoing] = useState<{ _id: string; recipient: FriendUser }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriends = async () => {
    const { data } = await friendsAPI.list();
    setFriends(data.data);
  };

  const loadRequests = async () => {
    const { data } = await friendsAPI.requests();
    setIncoming(data.data.incoming);
    setOutgoing(data.data.outgoing);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadFriends(), loadRequests()]).finally(() => setLoading(false));
  }, []);

  const respond = async (id: string, action: "accept" | "reject") => {
    await friendsAPI.respond(id, action);
    toast.success(action === "accept" ? "Friend added!" : "Declined");
    loadFriends();
    loadRequests();
  };

  const remove = async (id: string) => {
    await friendsAPI.remove(id);
    toast.success("Removed");
    loadFriends();
    loadRequests();
  };

  return (
    <div className="pt-[88px] container-x pb-16">
      <div className="text-center mb-8 max-w-md mx-auto">
        <h1 className="text-3xl font-black text-text-dark tracking-tight">Friends</h1>
        <p className="text-text-grey mt-1.5 text-[15px]">Connect with fellow travellers you meet on the road.</p>
      </div>

      <AnimatedTabs
        tabs={[
          { id: "friends", label: "Friends" },
          { id: "requests", label: `Pending (${incoming.length})` },
        ]}
        active={tab}
        onChange={(id) => setTab(id as typeof tab)}
        className="mb-8"
      />

      {loading ? (
        <div className="space-y-3 max-w-lg mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <AnimatedTabPanel id="friends" active={tab}>
            {friends.length === 0 ? (
              <EmptyState
                icon="👋"
                title="No friends yet"
                description="Send requests from Travel Match or Nearby to build your travel circle."
                cta="Find travellers"
                href="/match"
              />
            ) : (
              <div className="space-y-2 max-w-lg mx-auto">
                {friends.map((f) => (
                  <div
                    key={f.friendshipId}
                    className="flex items-center justify-between border border-[#EBEBEB] rounded-xl p-4 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                  >
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        {f.user.name}
                        {f.user.isVerified && <VerifiedBadge className="!text-[10px]" />}
                        <FriendStatusBadge status="friends" />
                      </p>
                      <Link href={`/chat?peer=${f.user._id}`} className="text-xs text-green-dark font-semibold hover:underline">
                        Message
                      </Link>
                    </div>
                    <button onClick={() => remove(f.friendshipId)} className="text-xs text-red-500 hover:underline touch-target px-2">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </AnimatedTabPanel>

          <AnimatedTabPanel id="requests" active={tab}>
            <div className="space-y-6 max-w-lg mx-auto">
              <div>
                <h3 className="font-bold mb-3 text-text-dark">Incoming</h3>
                {incoming.length === 0 ? (
                  <EmptyState variant="compact" icon="📬" title="No pending requests" description="When someone sends you a request, it will appear here." />
                ) : (
                  incoming.map((r) => (
                    <div key={r._id} className="flex items-center justify-between border rounded-xl p-4 mb-2 bg-white">
                      <span className="font-semibold">{r.requester.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => respond(r._id, "accept")}
                          aria-label={`Accept friend request from ${r.requester.name}`}
                          className="touch-target rounded-full bg-green-neon text-white flex items-center justify-center px-3"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => respond(r._id, "reject")}
                          aria-label={`Reject friend request from ${r.requester.name}`}
                          className="touch-target rounded-full border border-red-300 text-red-500 flex items-center justify-center px-3"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {outgoing.length > 0 && (
                <div>
                  <h3 className="font-bold mb-3">Sent ({outgoing.length})</h3>
                  {outgoing.map((r) => (
                    <div key={r._id} className="flex items-center justify-between border rounded-xl p-4 mb-2 text-sm bg-white">
                      <span>{r.recipient.name}</span>
                      <span className="flex items-center gap-2">
                        <FriendStatusBadge status="pending_sent" />
                        <button onClick={() => remove(r._id)} className="text-red-500 text-xs touch-target px-2" aria-label="Cancel friend request">
                          Cancel
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AnimatedTabPanel>
        </>
      )}
    </div>
  );
}
