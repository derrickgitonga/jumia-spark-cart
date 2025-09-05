import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderApprovalEmailRequest {
  email: string;
  customerName: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  orderId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Order approval email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, customerName, orderItems, totalAmount, orderId }: OrderApprovalEmailRequest = await req.json();

    console.log("Sending approval email to:", email);

    // Generate order details HTML
    const orderItemsHtml = orderItems.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>
    `).join('');

    const emailResponse = await resend.emails.send({
      from: "Simple PAY Global <onboarding@resend.dev>",
      to: [email],
      subject: "🎉 Your Order Has Been Approved!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #22c55e; font-size: 28px; margin-bottom: 10px;">Order Approved!</h1>
            <p style="color: #666; font-size: 16px;">Thank you for your purchase, ${customerName || 'valued customer'}!</p>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px;">Order Details</h2>
            <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderId.slice(0, 8)}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #374151; font-size: 18px; margin-bottom: 15px;">Items Ordered:</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #d1d5db;">Product</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #d1d5db;">Quantity</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #d1d5db;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
              </tbody>
            </table>
          </div>

          <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e; margin-bottom: 20px;">
            <h3 style="color: #166534; font-size: 18px; margin-bottom: 10px;">📦 Shipping Information</h3>
            <p style="color: #166534; margin: 5px 0;">Your order is now being processed for shipping.</p>
            <p style="color: #166534; margin: 5px 0;"><strong>Estimated Delivery:</strong> 3-5 business days</p>
            <p style="color: #166534; margin: 5px 0;">We'll send you tracking information once your package is shipped.</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Thank you for choosing Simple PAY Global!</p>
            <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">If you have any questions, please don't hesitate to contact our customer support.</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-approval-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);