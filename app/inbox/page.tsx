"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function fetchThreads() {
  const res = await axios.get("/api/threads");
  return res.data;
}

export default function InboxPage() {
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const qc = useQueryClient();

  const { data: threads } = useQuery({
  queryKey: ["threads"],
  queryFn: fetchThreads,
});


  const sendMutation = useMutation({
  mutationFn: async (payload: { to: string; body: string }) => {
    await axios.post("/api/messages/send", payload);
  },
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["threads"] });
    setTo("");
    setBody("");
  },
});



  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Unified Inbox</h1>

      <div className="mb-4">
        <input className="border p-2 mr-2" placeholder="+1..." value={to} onChange={(e)=>setTo(e.target.value)} />
        <textarea className="border p-2 block w-full mt-2" placeholder="Message" value={body} onChange={(e)=>setBody(e.target.value)} />
        <button onClick={()=>sendMutation.mutate({to, body})} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">Send</button>
      </div>

      <h2 className="text-lg font-semibold">Threads</h2>
      <ul>
        {threads?.map((t:any) => (
          <li key={t.id} className="border-b py-2">
            <div className="text-sm text-gray-500">{t.contact?.phone}</div>
            <div>{t.latestMessage?.body ?? "No messages yet"}</div>
            <div className="text-xs text-gray-400">{new Date(t.updatedAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
