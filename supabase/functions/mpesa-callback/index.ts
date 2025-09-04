import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const callbackData = await req.json();
    console.log('M-Pesa callback received:', JSON.stringify(callbackData, null, 2));

    // Initialize Supabase client
    const supabase = createClient(
      'https://hluibrulhhondkyfbhbh.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsdWlicnVsaGhvbmRreWZiaGJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjgwNzIzOSwiZXhwIjoyMDcyMzgzMjM5fQ.3L_FzANWEeT_wMTp8WNXjYxUGLF7ZlZqOcOa3qpSGE8'
    );

    const { Body } = callbackData;
    
    if (Body && Body.stkCallback) {
      const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = Body.stkCallback;
      
      console.log('Processing STK callback:', { ResultCode, ResultDesc, CheckoutRequestID });

      if (ResultCode === 0 && CallbackMetadata) {
        // Payment successful
        const items = CallbackMetadata.Item;
        const receiptNumber = items.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
        const amount = items.find((item: any) => item.Name === 'Amount')?.Value;
        const transactionDate = items.find((item: any) => item.Name === 'TransactionDate')?.Value;
        const phoneNumber = items.find((item: any) => item.Name === 'PhoneNumber')?.Value;

        console.log('Payment successful:', { receiptNumber, amount, transactionDate, phoneNumber });

        // You can update the order status here when payment is successful
        // For now, we'll just log the successful payment
        
      } else {
        // Payment failed or cancelled
        console.log('Payment failed or cancelled:', { ResultCode, ResultDesc });
      }
    }

    // Always return success to M-Pesa
    return new Response(JSON.stringify({ 
      ResultCode: 0,
      ResultDesc: "Callback received successfully" 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('M-Pesa callback error:', error);
    
    // Still return success to M-Pesa even if we have internal errors
    return new Response(JSON.stringify({ 
      ResultCode: 0,
      ResultDesc: "Callback received" 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});