import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "uploaded" | "verified" | "rejected" | "failed";
  receiptId: string;
  userEmail: string;
  amount?: number;
  notes?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, receiptId, userEmail, amount, notes }: NotificationRequest = await req.json();

    if (!type || !receiptId || !userEmail) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    const subjects: Record<string, string> = {
      uploaded: "Receipt Uploaded - Pending Review",
      verified: "Receipt Verified - Payment Credited",
      rejected: "Receipt Rejected - Action Required",
      failed: "Receipt Processing Failed",
    };

    const messages: Record<string, string> = {
      uploaded: `Your receipt has been uploaded and is pending admin review.`,
      verified: `Great news! Your receipt has been verified and ${amount ? `€${amount.toFixed(2)}` : "the amount"} has been credited to the community wallet.`,
      rejected: `Your receipt has been rejected. ${notes ? `Reason: ${notes}` : "Please contact admin for details."}`,
      failed: `We couldn't process your receipt automatically. An admin will review it manually.`,
    };

    if (RESEND_API_KEY) {
      // Send actual email via Resend API directly
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "PropManager <noreply@yourdomain.com>", // Replace with verified domain
          to: [userEmail],
          subject: subjects[type],
          html: `
            <h2>Receipt Status Update</h2>
            <p>${messages[type]}</p>
            <p>Receipt ID: ${receiptId}</p>
            <hr />
            <p>Thank you for using PropManager.</p>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error("Resend API error:", errorText);
      } else {
        console.log(`Email sent to ${userEmail} for ${type} notification`);
      }
    } else {
      // Log notification for development
      console.log(`[NOTIFICATION] Would send email to ${userEmail}:`, {
        subject: subjects[type],
        message: messages[type],
        receiptId,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-receipt-notification:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
