"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function Composer() {
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState("sms");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    const res = await fetch("/api/messages/send", {
      method: "POST",
      body: JSON.stringify({ to, body, channel }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await res.json();
    setLoading(false);

    alert(data.ok ? "Message sent!" : `Error: ${data.error}`);
  };

  return (
    <div className="p-4 bg-muted rounded-xl flex flex-col gap-2">
      <Select value={channel} onValueChange={setChannel}>
        <SelectTrigger>
          <SelectValue placeholder="Select Channel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sms">SMS</SelectItem>
          <SelectItem value="whatsapp">WhatsApp</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Recipient phone (+91...)"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />

      <Textarea
        placeholder="Type your message..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <Button onClick={handleSend} disabled={loading}>
        {loading ? "Sending..." : `Send via ${channel.toUpperCase()}`}
      </Button>
    </div>
  );
}
