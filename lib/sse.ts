// lib/sse.ts
type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

const clients: SSEClient[] = [];

export function addClient(id: string, controller: ReadableStreamDefaultController) {
  clients.push({ id, controller });
}

export function removeClient(id: string) {
  const index = clients.findIndex((c) => c.id === id);
  if (index !== -1) {
    try {
      clients[index].controller.close();
    } catch (_) {}
    clients.splice(index, 1);
  }
}

export function broadcast(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((client) => {
    try {
      client.controller.enqueue(payload);
    } catch {
      // controller closed, remove
      removeClient(client.id);
    }
  });
}

export function getClientCount() {
  return clients.length;
}
