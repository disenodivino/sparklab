import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase on the server side
const supabaseUrl = 'https://wawqvwyaijzcoynpxsvj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhd3F2d3lhaWp6Y295bnB4c3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTIzMTMsImV4cCI6MjA3NjI2ODMxM30.qxZC5V6izAjl0cvyoJP6hsj_euQ1By5Ko4kLirE8L0I';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Fetch messages schema information
    const { data: messageColumns, error: messageError } = await supabase.rpc(
      'get_schema_info',
      { table_name: 'messages' }
    );

    if (messageError) {
      return NextResponse.json({
        error: 'Could not query schema info',
        details: messageError
      }, { status: 500 });
    }

    // Try a simplified version of the problematic query
    const { data: messages, error: messagesQueryError } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id')
      .limit(1);

    // Try both relationships explicitly
    const [ senderResult, receiverResult ] = await Promise.all([
      supabase
        .from('messages')
        .select('id, sender:users!messages_sender_id_fkey(name)')
        .limit(1),
      supabase
        .from('messages')
        .select('id, receiver:users!messages_receiver_id_fkey(name)')
        .limit(1)
    ]);

    return NextResponse.json({
      success: true,
      messageColumns,
      messages,
      messagesQueryError,
      senderQuery: {
        data: senderResult.data,
        error: senderResult.error
      },
      receiverQuery: {
        data: receiverResult.data,
        error: receiverResult.error
      },
      recommendation: `
        Based on the results, use the following query patterns:
        1. For sender name: messages.select('sender:users!messages_sender_id_fkey(name)')
        2. For receiver name: messages.select('receiver:users!messages_receiver_id_fkey(name)')
      `
    });
  } catch (error) {
    console.error('Error diagnosing database:', error);
    return NextResponse.json({
      error: 'Failed to diagnose database',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}