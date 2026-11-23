// Reads and writes the signed-in user's data. lab_results is the table the
// SelfHealth app uses for bloodwork, so test_name must be one of the app's
// marker names (see markers.data.js); tool_entries holds the website's own
// calculator readings. RLS limits both to the signed-in user.
import { supabase } from './supabaseClient.js';

async function userId() {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user?.id;
  if (!id) throw new Error('Not signed in');
  return id;
}

/** A yyyy-mm-dd date from a date input, stored at local noon so it never shifts a day. */
export function dateToTimestamp(day) {
  if (!day) return new Date().toISOString();
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d, 12).toISOString();
}

export async function fetchLabResults() {
  const { data, error } = await supabase
    .from('lab_results')
    .select('id, test_name, value, unit, reference_range, date, fasting, notes')
    .eq('user_id', await userId())
    .order('date', { ascending: true });
  if (error) throw error;
  return data;
}

/** entries: [{ test_name, value, unit }] all drawn on the same day. */
export async function addLabResults(entries, { day, fasting = null } = {}) {
  const uid = await userId();
  const date = dateToTimestamp(day);
  const rows = entries.map((e) => ({
    user_id: uid,
    test_name: e.test_name,
    value: e.value,
    unit: e.unit,
    date,
    fasting,
  }));
  const { error } = await supabase.from('lab_results').insert(rows);
  if (error) throw error;
}

export async function deleteLabResult(id) {
  const { error } = await supabase.from('lab_results').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchToolEntries(tool) {
  let query = supabase
    .from('tool_entries')
    .select('id, tool, value, unit, inputs, recorded_at')
    .eq('user_id', await userId())
    .order('recorded_at', { ascending: true });
  if (tool) query = query.eq('tool', tool);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function addToolEntries(entries) {
  const uid = await userId();
  const rows = entries.map((e) => ({
    user_id: uid,
    tool: e.tool,
    value: e.value,
    unit: e.unit || '',
    inputs: e.inputs || {},
    recorded_at: e.recorded_at || new Date().toISOString(),
  }));
  const { error } = await supabase.from('tool_entries').insert(rows);
  if (error) throw error;
}

export async function deleteToolEntry(id) {
  const { error } = await supabase.from('tool_entries').delete().eq('id', id);
  if (error) throw error;
}
