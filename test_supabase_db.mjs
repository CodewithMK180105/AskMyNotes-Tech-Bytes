import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cbghvyibfjdgwhsvsthw.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZ2h2eWliZmpkZ3doc3ZzdGh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA5MzQxMywiZXhwIjoyMDg3NjY5NDEzfQ.CVdB-odcA-NopeCZYYNa0CHdO1-5k1ZgImCJliGxjds";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testDb() {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    console.log('Result:', { data, error });
}

testDb();
