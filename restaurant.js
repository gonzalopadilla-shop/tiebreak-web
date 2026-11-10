const $=s=>document.querySelector(s);
const day=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Madrid'}).format(new Date());
const uid=()=>crypto.randomUUID();
async function api(path,options={}){const response=await fetch('https://tiebreak-restaurante.tiebreak-club-demo.workers.dev'+path,{credentials:'omit',cache:'no-store',...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});let data;try{data=await response.json()}catch{throw new Error('No se pudo contactar con el servidor. Inténtalo de nuevo.')}if(!response.ok)throw new Error(data.error||'No se ha podido completar la operación.');return data;}

const restaurantPhone='34663781595';
const tomorrow=()=>{const d=new Date(day()+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10)};
$('#booking [name=date]').min=tomorrow();$('#booking [name=date]').value=tomorrow();
let submissionKey=null,submissionPayload=null;
function setMode(mode){$('#booking').hidden=mode!=='reserve';$('#cancel-booking').hidden=mode!=='cancel';$('#edit-booking').hidden=mode!=='edit';for(const [id,m] of [['reserve','reserve'],['cancel','cancel'],['edit','edit']])$('#show-'+id).setAttribute('aria-pressed',String(mode===m));}
$('#show-reserve').onclick=()=>{location.hash='reservar';setMode('reserve')};$('#show-cancel').onclick=()=>{location.hash='cancelar';setMode('cancel')};$('#show-edit').onclick=()=>{location.hash='editar';setMode('edit')};
function syncMode(){const mode=location.hash==='#cancelar'?'cancel':location.hash==='#editar'?'edit':'reserve';setMode(mode);if(mode!=='reserve')$('#reservar').scrollIntoView({block:'start'});}
window.addEventListener('hashchange',syncMode);syncMode();
function openWhatsApp(popup,message){const url='https://wa.me/'+restaurantPhone+'?text='+encodeURIComponent(message);if(popup&&!popup.closed){popup.opener=null;popup.location.replace(url);}else location.assign(url);}
function showResult(target,text,id){target.textContent=text;const code=document.createElement('strong');code.className='reference-code';code.textContent='Referencia: '+id.slice(0,8);target.append(code);}
$('#booking').onsubmit=async e=>{
 e.preventDefault();const form=e.target,button=form.querySelector('button[type=submit]'),f=Object.fromEntries(new FormData(form));
 if(f.date<=day()){ $('#booking-result').textContent='Para reservar hoy, llama al 663 781 595. Elige mañana o una fecha posterior para reservar online.';return; }
 const payload=JSON.stringify(f);if(submissionPayload!==payload){submissionKey=uid();submissionPayload=payload;}
 const popup=window.open('about:blank','_blank');button.disabled=true;button.textContent='Guardando…';$('#booking-result').textContent='';
 try{const result=await api('/api/reservations',{method:'POST',body:JSON.stringify({...f,requestKey:submissionKey})});
 const date=f.date.split('-').reverse().join('/');const message='Hola, quiero solicitar una reserva en Tie Break.\nNombre: '+f.name+'\nFecha: '+date+'\nHora: '+f.time+'\nPersonas: '+f.guests+'\nZona: '+f.area+'\nCarros de bebé: '+f.strollers+'\nTeléfono: '+f.phone+'\nPeticiones: '+(f.notes||'Sin peticiones')+'\nReferencia: '+result.id.slice(0,8)+'\n¿Podéis confirmarla?\nPara cancelar: https://gonzalopadilla-shop.github.io/tiebreak-web/#cancelar (referencia y teléfono).' ;
 showResult($('#booking-result'),'Solicitud guardada, pendiente de confirmación. Se abre WhatsApp con los datos preparados: pulsa Enviar para avisar al restaurante. Conserva tu referencia para cancelar.',result.id);
 $('#cancel-booking [name=reference]').value=result.id.slice(0,8);$('#cancel-booking [name=phone]').value=f.phone;
 form.reset();$('#booking [name=date]').value=tomorrow();submissionKey=null;submissionPayload=null;openWhatsApp(popup,message);
 }catch(error){if(popup&&!popup.closed)popup.close();$('#booking-result').textContent=error.message;}finally{button.disabled=false;button.textContent='Solicitar mesa ↗';refreshAvailability();}
};
$('#cancel-booking').onsubmit=async e=>{
 e.preventDefault();const form=e.target,button=form.querySelector('button[type=submit]'),f=Object.fromEntries(new FormData(form));
 const popup=window.open('about:blank','_blank');button.disabled=true;button.textContent='Cancelando…';$('#cancel-result').textContent='';
 try{const result=await api('/api/cancellations',{method:'POST',body:JSON.stringify(f)});showResult($('#cancel-result'),result.alreadyCancelled?'Esta reserva ya estaba cancelada.':'Reserva cancelada en la app. Se abre WhatsApp para avisar al restaurante.',result.id);openWhatsApp(popup,'Hola, he cancelado mi reserva en Tie Break.\nReferencia: '+result.id.slice(0,8)+'\nCarros de bebé: '+f.strollers+'\nTeléfono: '+f.phone+'\nLa cancelación ya está registrada en la app.');}
 catch(error){if(popup&&!popup.closed)popup.close();$('#cancel-result').textContent=error.message;}finally{button.disabled=false;button.textContent='Cancelar reserva ↗';refreshAvailability();}
};

let availabilitySeq=0;
async function refreshAvailability(){const seq=++availabilitySeq;const f=$('#booking'),date=f.elements.date.value,area=f.elements.area.value,guests=Number(f.elements.guests.value),needed=Math.max(1,Math.ceil((guests-2)/2))+(Number(f.elements.strollers.value)>0?1:0);
 if(!date)return;try{const data=await api('/api/availability?date='+encodeURIComponent(date)+'&time='+encodeURIComponent(f.elements.time.value));if(seq!==availabilitySeq)return;const zone=data.areas.find(a=>a.area===area);$('#availability').textContent=needed>zone.available?'No hay espacio suficiente en '+area+' de '+data.time+' a '+data.end+'. Elige otra zona o fecha.':'Hay disponibilidad en '+area+' de '+data.time+' a '+data.end+' para tu grupo.';f.querySelector('button[type=submit]').disabled=needed>zone.available;}catch{if(seq===availabilitySeq)$('#availability').textContent='Comprobaremos las mesas disponibles al guardar la solicitud.';}}
for(const name of ['date','time','area','guests','strollers']){const field=$('#booking').elements[name];field.addEventListener('change',refreshAvailability);field.addEventListener('input',refreshAvailability);}
refreshAvailability();

let editRevision=null;
const editForm=$('#edit-booking');
for(const name of ['reference','phone'])editForm.elements[name].addEventListener('input',()=>{editRevision=null;$('#edit-fields').hidden=true;editForm.querySelector('button[type=submit]').textContent='Buscar reserva';});
editForm.onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(editForm)),button=editForm.querySelector('button[type=submit]'),saving=editRevision!==null;button.disabled=true;$('#edit-result').textContent='';const popup=saving?window.open('about:blank','_blank'):null;
try{const result=await api('/api/booking-edit',{method:'POST',body:JSON.stringify({...f,action:saving?'save':'lookup',revision:editRevision})});if(!saving){editRevision=result.revision;$('#edit-fields').hidden=false;editForm.elements.guests.value=result.guests;editForm.elements.strollers.value=result.strollers;editForm.elements.notes.value=result.notes;$('#edit-summary').textContent=result.name+' · '+result.date.split('-').reverse().join('/')+' · '+result.time+' · '+result.area;button.textContent='Guardar cambios ↗';}else{if(result.unchanged){if(popup)popup.close();$('#edit-result').textContent='No has cambiado ningún dato.';}else{editRevision=result.revision;showResult($('#edit-result'),'Modificación guardada, pendiente de revisión. Se abre WhatsApp para avisar al restaurante.',result.id);openWhatsApp(popup,'Hola, he modificado mi reserva en Tie Break.\nReferencia: '+result.id.slice(0,8)+'\nPersonas: '+f.guests+'\nCarros de bebé: '+f.strollers+'\nPeticiones: '+(f.notes||'Sin peticiones')+'\nTeléfono: '+f.phone+'\nLos cambios ya aparecen en la app.');}}}catch(error){if(popup&&!popup.closed)popup.close();$('#edit-result').textContent=error.message;}finally{button.disabled=false;}};
