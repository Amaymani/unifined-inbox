"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function ContactProfile({ thread, onClose }: { thread: any; onClose: () => void }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (thread?.id) {
      fetch(`/api/notes?threadId=${thread.id}`)
        .then((res) => res.json())
        .then(setNotes);
    }
  }, [thread]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    const res = await fetch("/api/notes", {
      method: "POST",
      body: JSON.stringify({
        threadId: thread.id,
        content: newNote,
        isPrivate,
      }),
    });
    const note = await res.json();
    setNotes([note, ...notes]);
    setNewNote("");
    setIsPrivate(false);
  };

  if (!thread) return null;

  const contact = thread.contact;

  return (
    <Dialog open={!!thread} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Contact Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium">{contact?.name || "Unknown Contact"}</h3>
            <p className="text-sm text-muted-foreground">{contact?.phone}</p>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2">Add Note</h4>
            <Textarea
              placeholder="Write a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
                <span className="text-xs text-muted-foreground">Private note</span>
              </div>
              <Button onClick={addNote} disabled={!newNote.trim()}>
                Add
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2">Notes</h4>
            <div className="max-h-[200px] overflow-y-auto space-y-3">
              {notes.length === 0 && (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              )}
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="p-2 border rounded-md bg-muted/40 text-sm"
                >
                  <p>{n.content}</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    — {n.author?.email} • {new Date(n.createdAt).toLocaleString()}
                    {n.isPrivate && " 🔒"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
