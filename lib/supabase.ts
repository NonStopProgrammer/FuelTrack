import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://npvldranlcamkepxkzbf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wdmxkcmFubGNhbWtlcHhremJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDg1MDcsImV4cCI6MjA4MDQyNDUwN30.KkGmreAbmeD4gCOL3YiyCA5p4pMjLHWastf1OgrYPBA';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}