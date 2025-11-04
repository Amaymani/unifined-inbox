import twilio from "twilio";

export type ChannelPayload = {
  to: string;
  from?: string;
  body: string;
  mediaUrl?: string;
};

export function createSender(channel: "sms" | "whatsapp") {
  if (channel === "sms" || channel === "whatsapp") {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

    return {
      send: async (payload: ChannelPayload) => {
        const formattedTo =
          channel === "whatsapp" ? `whatsapp:${payload.to}` : payload.to;

        const formattedFrom =
          channel === "whatsapp"
            ? `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`
            : process.env.TWILIO_SMS_NUMBER;

        const message = await client.messages.create({
          to: formattedTo,
          from: formattedFrom,
          body: payload.body,
          mediaUrl: payload.mediaUrl ? [payload.mediaUrl] : undefined,
        });

        return message.sid;
      },
    };
  }

  throw new Error(`Unsupported channel: ${channel}`);
}
