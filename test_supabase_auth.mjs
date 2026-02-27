import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cbghvyibfjdgwhsvsthw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZ2h2eWliZmpkZ3doc3ZzdGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTM0MTMsImV4cCI6MjA4NzY2OTQxM30.NBEbpKdTnAQ982mWpyirmpiTTshBvYEim_HZ2Vekwe8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuth() {
    const { data, error } = await supabase.auth.signUp({
        email: 'test' + Date.now() + '@example.com',
        password: 'password123'
    });
    console.log('Result:', { data, error });
}

testAuth();
