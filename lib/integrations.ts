// lib/integrations.ts
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export function createSender(channel: string) {
  return {
    send: async (payload: {
      to: string;
      body?: string;
      mediaUrl?: string;
    }) => {
      try {
        const formattedTo =
          channel === "whatsapp"
            ? payload.to.startsWith("whatsapp:")
              ? payload.to
              : `whatsapp:${payload.to}`
            : payload.to;

        const formattedFrom =
          channel === "whatsapp"
            ? `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER!}`
            : process.env.TWILIO_SMS_NUMBER!;

        if (!formattedFrom) {
          throw new Error(
            "Missing TWILIO_SMS_NUMBER or TWILIO_WHATSAPP_NUMBER in env"
          );
        }

        const message = await client.messages.create({
          to: formattedTo,
          from: formattedFrom, // ✅ This fixes 21603
          body: payload.body,
          ...(payload.mediaUrl ? { mediaUrl: [payload.mediaUrl] } : {}),
        });

        console.log(`✅ Sent ${channel} message SID:`, message.sid);
        return message.sid;
      }catch (err: any) {
        // Twilio error code mapping
        const code = err.code ?? "UNKNOWN";
        const msg = err.message ?? "Unknown Twilio error";

        console.error(`❌ Twilio ${channel.toUpperCase()} send failed:`, {
          code,
          message: msg,
          to: payload.to,
          from:
            channel === "whatsapp"
              ? process.env.TWILIO_WHATSAPP_NUMBER
              : process.env.TWILIO_SMS_NUMBER,
        });
        if (channel === "whatsapp" && code === 21603) {
          console.warn(
            "⚠️  Twilio error 21603: WhatsApp sender not enabled. Make sure the recipient joined your Twilio sandbox."
          );
        }

        throw new Error(`Twilio Error ${code}: ${msg}`);
      }
    },
  };
}
