import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = "https://cxfsgqhviwtcsrrwqxrn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4ZnNncWh2aXd0Y3NycndxeHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjU2ODIsImV4cCI6MjA3NjkwMTY4Mn0.mQDxYulJhAb3yIJE16zH9V1H2zbfAu2w_du6cj10MFs";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkAdmin() {
    const userId = '0fbc45b5-0c5e-4040-821b-851b9c099175';

    // Try inserting explicitly
    const { data: insertData, error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });

    if (insertError) {
        console.log('Insert error:', insertError);
    } else {
        console.log('Insert success:', insertData);
    }

    const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

    console.log('Current roles for user:', data, error);
}

checkAdmin();
