import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cxfsgqhviwtcsrrwqxrn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4ZnNncWh2aXd0Y3NycndxeHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjU2ODIsImV4cCI6MjA3NjkwMTY4Mn0.mQDxYulJhAb3yIJE16zH9V1H2zbfAu2w_du6cj10MFs";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function setupAdmin() {
    console.log('Signing up admin user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'privatepple@gmail.com',
        password: '0912577754',
    });

    if (authError) {
        if (authError.message === 'User already registered') {
            console.log("User already exists, trying to sign in to get ID...");
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: 'privatepple@gmail.com',
                password: '0912577754',
            });
            if (signInError) {
                console.error("Sign in failed:", signInError);
                return;
            }
            await updateRole(signInData.user.id);
        } else {
            console.error('Auth Error:', authError);
            return;
        }
    } else if (authData.user) {
        console.log('User created:', authData.user.id);
        await updateRole(authData.user.id);
    } else {
        console.log('No user returned structure:', authData);
    }
}

async function updateRole(userId) {
    console.log('Setting role to admin for user:', userId);
    const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id' });

    if (roleError) {
        console.error('Error setting role:', roleError);
        // Try update if upsert fails
        const { error: updateError } = await supabase
            .from('user_roles')
            .update({ role: 'admin' })
            .eq('user_id', userId);
        if (updateError) console.error("Update also failed:", updateError);
        else console.log("Update succeeded!");
    } else {
        console.log('Successfully set admin role:', roleData);
    }
}

setupAdmin();
