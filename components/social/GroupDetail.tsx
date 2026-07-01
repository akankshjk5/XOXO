"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Send, Loader2, LogOut, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { groupsAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { getSocket, joinGroupRoom } from "@/lib/socket";
import { VerifiedBadge } from "@/components/social/VerifiedBadge";
import { LoadingSkeleton } from "@/components/motion";

interface Member { user: { _id: string; name: string; avatar?: string; isVerified?: boolean }; role: string }
interface Group { _id: string; title: string; destination: string; departureDate: string; description?: string; creator: { _id: string; name: string }; members: Member[]; maxMembers: number; status: string }
interface GMsg { _id?: string; sender: { _id: string; name: string; avatar?: string }; content: string; createdAt?: string }

export function GroupDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<GMsg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isMember = group && user && (
    String(group.creator._id) === user._id ||
    group.members.some((m) => String(m.user._id) === user._id)
  );

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await groupsAPI.getById(id);
        setGroup(data.data);
      } catch {
        toast.error("Group not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!id || !isMember) return;
    groupsAPI.getMessages(id).then(({ data }) => {
      setMessages(data.data.messages);
      joinGroupRoom(id);
    }).catch(() => {});
    const socket = getSocket();
    const onMsg = (m: GMsg) => setMessages((prev) => [...prev, m]);
    socket.on("groupMessage", onMsg);
    return () => { socket.off("groupMessage", onMsg); };
  }, [id, isMember]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const join = async () => {
    if (!id) return;
    try {
      await groupsAPI.join(id);
      const { data } = await groupsAPI.getById(id);
      setGroup(data.data);
      toast.success("Joined the group!");
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Couldn't join");
    }
  };

  const leave = async () => {
    if (!id) return;
    await groupsAPI.leave(id);
    toast.success("Left group");
    router.push("/groups");
  };

  const send = async () => {
    if (!id || !text.trim()) return;
    const content = text.trim();
    setText("");
    try {
      const { data } = await groupsAPI.sendMessage(id, content);
      setMessages((prev) => [...prev, data.data]);
    } catch {
      setText(content);
    }
  };

  const removeMember = async (userId: string) => {
    if (!id) return;
    const { data } = await groupsAPI.removeMember(id, userId);
    setGroup(data.data);
    toast.success("Member removed");
  };

  if (loading) {
    return (
      <div className="pt-[88px] max-w-3xl mx-auto px-4 pb-16 space-y-4">
        <LoadingSkeleton className="h-10 w-64 rounded-xl" />
        <LoadingSkeleton className="h-48 rounded-2xl" />
        <LoadingSkeleton className="h-64 rounded-2xl" />
      </div>
    );
  }
  if (!group) return <div className="pt-32 text-center"><Link href="/groups" className="text-green-dark font-semibold">← Back</Link></div>;

  return (
    <div className="pt-[88px] max-w-[1000px] mx-auto px-4 sm:px-6 pb-8">
      <div className="mb-4">
        <Link href="/groups" className="text-sm text-green-dark font-semibold">← All groups</Link>
        <h1 className="text-2xl font-black text-text-dark mt-2">{group.title}</h1>
        <p className="text-text-grey">{group.destination} · {new Date(group.departureDate).toLocaleDateString()}</p>
        {group.description && <p className="text-sm text-text-grey mt-2">{group.description}</p>}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <aside className="border border-[#EBEBEB] rounded-2xl p-4 h-fit">
          <h3 className="font-bold mb-3 flex items-center gap-2"><Users className="h-4 w-4" /> Members ({group.members.length}/{group.maxMembers})</h3>
          <ul className="space-y-2">
            {group.members.map((m) => (
              <li key={m.user._id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  {m.user.name}
                  {m.user.isVerified && <VerifiedBadge className="!text-[10px]" />}
                  {m.role === "creator" && <span className="text-xs text-amber-600">(host)</span>}
                </span>
                {String(group.creator._id) === user?._id && m.role !== "creator" && (
                  <button onClick={() => removeMember(m.user._id)} className="text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                )}
              </li>
            ))}
          </ul>
          {!isMember && group.status === "open" && (
            <button onClick={join} className="w-full mt-4 py-2.5 rounded-full bg-green-neon text-white font-bold">Join group</button>
          )}
          {isMember && String(group.creator._id) !== user?._id && (
            <button onClick={leave} className="w-full mt-4 py-2 border border-red-300 text-red-500 rounded-full text-sm flex items-center justify-center gap-1"><LogOut className="h-3.5 w-3.5" /> Leave</button>
          )}
        </aside>

        <section className="lg:col-span-2 border border-[#EBEBEB] rounded-2xl flex flex-col h-[50vh]">
          <div className="px-4 py-3 border-b font-semibold text-sm">Group chat</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-off-white/40">
            {!isMember ? (
              <p className="text-center text-text-grey text-sm py-8">Join the group to chat.</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-text-grey text-sm py-8">Start the conversation!</p>
            ) : (
              messages.map((m, i) => {
                const mine = String(m.sender?._id || m.sender) === user?._id;
                return (
                  <div key={m._id || i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${mine ? "bg-green-neon text-white" : "bg-white border"}`}>
                      {!mine && <p className="text-[10px] font-semibold opacity-70 mb-0.5">{m.sender?.name}</p>}
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
          {isMember && (
            <div className="p-3 border-t flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message the group…" className="flex-1 border rounded-full px-4 py-2 outline-none focus:border-green-dark" />
              <button onClick={send} className="h-10 w-10 rounded-full bg-green-neon text-white flex items-center justify-center"><Send className="h-4 w-4" /></button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
