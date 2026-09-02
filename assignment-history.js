// assignment_history 共通ロジック（店舗・役職など属性を問わず使い回せる）

async function loadAssignmentHistory(sb){
  const {data} = await sb.from('assignment_history').select('*');
  return data || [];
}

function valueAsOf(history, studentId, attribute, dateStr){
  const rows = history.filter(function(h){
    return h.student_id===studentId && h.attribute===attribute && h.effective_from<=dateStr;
  });
  if(!rows.length) return null;
  rows.sort(function(a,b){return a.effective_from<b.effective_from?1:-1;});
  return rows[0].value;
}

function monthToDate(monthStr){
  return monthStr + '-01';
}

async function saveAssignmentChange(sb, studentId, attribute, value, effectiveFrom, note){
  await sb.from('assignment_history').insert({
    student_id: studentId, attribute: attribute, value: value,
    effective_from: effectiveFrom, note: note || null
  });
  const today = new Date().toISOString().slice(0,10);
  if(effectiveFrom <= today){
    const field = attribute;
    await sb.from('students').update({[field]: value}).eq('id', studentId);
  }
}

function futureChangesOf(history, studentId, attribute){
  const today = new Date().toISOString().slice(0,10);
  return history.filter(function(h){
    return h.student_id===studentId && h.attribute===attribute && h.effective_from>today;
  }).sort(function(a,b){return a.effective_from<b.effective_from?-1:1;});
}
