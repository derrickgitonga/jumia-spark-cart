-- Fix RLS policies for order_items to allow INSERT
CREATE POLICY "Users can insert order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM orders 
  WHERE orders.id = order_items.order_id 
  AND orders.user_id = auth.uid()
));

-- Update orders table to allow processing status
ALTER TABLE public.orders 
ALTER COLUMN status SET DEFAULT 'processing';

-- Update the status column to allow processing value  
ALTER TABLE public.orders 
ADD CONSTRAINT valid_status CHECK (status IN ('processing', 'pending', 'approved', 'rejected'));