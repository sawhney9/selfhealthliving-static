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

/** entries: [{ test_name, value, unit, reference_range?, day? }]; `day` per entry overrides the shared one. */
export async function addLabResults(entries, { day, fasting = null } = {}) {
  const uid = await userId();
  const rows = entries.map((e) => ({
    user_id: uid,
    test_name: e.test_name,
    value: e.value,
    unit: e.unit,
    reference_range: e.reference_range ?? null,
    date: dateToTimestamp(e.day || day),
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

// Goals: one per metric. metric is a lab test_name, or `tool:<slug>` for a calculator.
export async function fetchGoals() {
  const { data, error } = await supabase
    .from('health_goals')
    .select('metric, target, direction')
    .eq('user_id', await userId());
  if (error) throw error;
  return Object.fromEntries(data.map((g) => [g.metric, { target: Number(g.target), direction: g.direction }]));
}

export async function saveGoal(metric, target, direction) {
  const { error } = await supabase
    .from('health_goals')
    .upsert(
      { user_id: await userId(), metric, target, direction, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,metric' }
    );
  if (error) throw error;
}

export async function deleteGoal(metric) {
  const { error } = await supabase.from('health_goals').delete().eq('user_id', await userId()).eq('metric', metric);
  if (error) throw error;
}

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

/**
 * Reads a lab report PDF with the app's `lab-extraction` Edge Function.
 * Returns [{ marker, value, unit, refLow, refHigh, collectionDate, confidence, reviewSuggested }].
 */
export async function extractLabsFromPdf(file) {
  const pdfBase64 = toBase64(await file.arrayBuffer());
  const { data, error } = await supabase.functions.invoke('lab-extraction', { body: { pdfBase64 } });
  if (error) {
    const status = error.context?.status;
    if (status === 429) throw new Error('You’ve uploaded several reports in a short time. Wait a bit and try again.');
    throw new Error('We couldn’t read that report. Try again, or add the values by hand.');
  }
  return data?.markers || [];
}

/** Lab reference range text, written the way the app writes it ("70–99", "<100", ">40"). */
export function referenceRangeText(low, high) {
  if (low != null && high != null) return `${low}–${high}`;
  if (high != null) return `<${high}`;
  if (low != null) return `>${low}`;
  return null;
}

/** The app's Apple Health readings of one type (e.g. 'vo2_max'), oldest first. */
export async function fetchHealthMetrics(metricType) {
  const { data, error } = await supabase
    .from('health_metrics')
    .select('value, unit, recorded_at')
    .eq('user_id', await userId())
    .eq('metric_type', metricType)
    .order('recorded_at', { ascending: true })
    .limit(2000);
  if (error) throw error;
  return data;
}
