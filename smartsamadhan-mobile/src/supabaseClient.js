import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://enulwcpfahwxfqyummyk.supabase.co';
const supabaseKey = 'sb_publishable_mNgFkeIrzydcZEDSuyk44A_G2-2Ew2N';

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
