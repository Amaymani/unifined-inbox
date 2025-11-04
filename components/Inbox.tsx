"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ContactProfile from "@/components/ContactProfile";

export default function Inbox() {
  interface Thread {
    id: string;
    status: string;
    contact?: {
      name?: string;
      phone?: string;
    };
    messages?: { body: string }[];
  }

  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeThreadData, setActiveThreadData] = useState<any>(null); // 👈 for ContactProfile modal

  // ✅ Load threads initially
  const loadThreads = async () => {
    const res = await fetch("/api/threads");
    const data = await res.json();
    setThreads(data);
  };

  // ✅ Load messages for selected thread
  const loadMessages = async (threadId: string) => {
    const res = await fetch(`/api/messages/${threadId}`);
    const data = await res.json();
    setMessages(data);
  };

  // ✅ Initial load
  useEffect(() => {
    loadThreads();
  }, []);

  // ✅ Open thread & load messages
  const openThread = async (threadId: string) => {
    setSelectedThread(threadId);
    await loadMessages(threadId);
    const thread = threads.find((t) => t.id === threadId);
    setActiveThreadData(thread); // 👈 store current thread for modal
  };

  // ✅ SSE listener for real-time updates
  useEffect(() => {
    const ev = new EventSource("/api/events");

    ev.addEventListener("new-message", (e) => {
      const msg = JSON.parse(e.data);
      console.log("📩 SSE received:", msg);

      // re-fetch updated data
      fetch("/api/threads").then((r) => r.json()).then(setThreads);

      if (selectedThread && msg.threadId === selectedThread) {
        fetch(`/api/messages/${selectedThread}`)
          .then((r) => r.json())
          .then(setMessages);
      }
    });

    ev.onerror = (err) => {
      console.error("❌ SSE error:", err);
      ev.close();
    };

    return () => ev.close();
  }, [selectedThread]);

  // ✅ Close contact profile modal
  const closeProfile = () => {
    setActiveThreadData(null);

  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Thread list */}
      <div className="space-y-3">
        {threads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No conversations yet.</p>
        ) : (
          threads.map((t) => (
            <Card
              key={t.id}
              onClick={() => openThread(t.id)}
              className={`cursor-pointer hover:bg-accent transition ${
                selectedThread === t.id ? "border-primary" : ""
              }`}
            >
              <CardHeader className="flex justify-between items-center">
                <CardTitle>{t.contact?.name || t.contact?.phone}</CardTitle>
                <Badge
                  variant={t.status === "OPEN" ? "default" : "secondary"}
                >
                  {t.status}
                </Badge>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground truncate">
                {t.messages?.[0]?.body || "No messages yet"}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Message pane */}
      {selectedThread && (
        <div className="border rounded-lg p-4 space-y-2 overflow-y-auto max-h-[70vh]">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Messages</h2>
            {/* 👇 View contact details button */}
            <button
              onClick={() => setActiveThreadData(threads.find((t) => t.id === selectedThread))}
              className="text-sm text-primary hover:underline"
            >
              View Contact
            </button>
          </div>

          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-2 rounded-md ${
                m.direction === "OUTBOUND"
                  ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
                  : "bg-muted max-w-[80%]"
              }`}
            >
              <p>{m.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Contact Profile Modal */}
      {activeThreadData && (
        <ContactProfile
          thread={activeThreadData}
          onClose={closeProfile}
        />
      )}
    </div>
  );
}
