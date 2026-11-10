const $=s=>document.querySelector(s);
const day=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Madrid'}).format(new Date());
const uid=()=>crypto.randomUUID();
async function api(path,options={}){const response=await fetch('https://tiebreak-restaurante.tiebreak-club-demo.workers.dev'+path,{credentials:'omit',cache:'no-store',...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});let data;try{data=await response.json()}catch{throw new Error('No se pudo contactar con el servidor. Inténtalo de nuevo.')}if(!response.ok)throw new Error(data.error||'No se ha podido completar la operación.');return data;}

const restaurantPhone='34663781595';
const tomorrow=()=>{const d=new Date(day()+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10)};
$('#booking [name=date]').min=tomorrow();$('#booking [name=date]').value=tomorrow();
let submissionKey=null,submissionPayload=null;
function setMode(cancel){$('#booking').hidden=cancel;$('#cancel-booking').hidden=!cancel;$('#show-reserve').setAttribute('aria-pressed',String(!cancel));$('#show-cancel').setAttribute('aria-pressed',String(cancel));}
$('#show-reserve').onclick=()=>{location.hash='reservar';setMode(false)};$('#show-cancel').onclick=()=>{location.hash='cancelar';setMode(true)};
function syncMode(){const cancel=location.hash==='#cancelar';setMode(cancel);if(cancel)$('#reservar').scrollIntoView({block:'start'});}
window.addEventListener('hashchange',syncMode);syncMode();
function openWhatsApp(popup,message){const url='https://wa.me/'+restaurantPhone+'?text='+encodeURIComponent(message);if(popup&&!popup.closed){popup.opener=null;popup.location.replace(url);}else location.assign(url);}
function showResult(target,text,id){target.textContent=text;const code=document.createElement('strong');code.className='reference-code';code.textContent='Referencia: '+id.slice(0,8);target.append(code);}
$('#booking').onsubmit=async e=>{
 e.preventDefault();const form=e.target,button=form.querySelector('button[type=submit]'),f=Object.fromEntries(new FormData(form));
 if(f.date<=day()){ $('#booking-result').textContent='Para reservar hoy, llama al 663 781 595. Elige mañana o una fecha posterior para reservar online.';return; }
 const payload=JSON.stringify(f);if(submissionPayload!==payload){submissionKey=uid();submissionPayload=payload;}
 const popup=window.open('about:blank','_blank');button.disabled=true;button.textContent='Guardando…';$('#booking-result').textContent='';
 try{const result=await api('/api/reservations',{method:'POST',body:JSON.stringify({...f,requestKey:submissionKey})});
 const date=f.date.split('-').reverse().join('/');const message='Hola, quiero solicitar una reserva en Tie Break.\nNombre: '+f.name+'\nFecha: '+date+'\nHora: '+f.time+'\nPersonas: '+f.guests+'\nZona: '+f.area+'\nTeléfono: '+f.phone+'\nPeticiones: '+(f.notes||'Sin peticiones')+'\nReferencia: '+result.id.slice(0,8)+'\n¿Podéis confirmarla?\nPara cancelar: https://gonzalopadilla-shop.github.io/tiebreak-web/#cancelar (referencia y teléfono).' ;
 showResult($('#booking-result'),'Solicitud guardada, pendiente de confirmación. Se abre WhatsApp con los datos preparados: pulsa Enviar para avisar al restaurante. Conserva tu referencia para cancelar.',result.id);
 $('#cancel-booking [name=reference]').value=result.id.slice(0,8);$('#cancel-booking [name=phone]').value=f.phone;
 form.reset();$('#booking [name=date]').value=tomorrow();submissionKey=null;submissionPayload=null;openWhatsApp(popup,message);
 }catch(error){if(popup&&!popup.closed)popup.close();$('#booking-result').textContent=error.message;}finally{button.disabled=false;button.textContent='Solicitar mesa ↗';refreshAvailability();}
};
$('#cancel-booking').onsubmit=async e=>{
 e.preventDefault();const form=e.target,button=form.querySelector('button[type=submit]'),f=Object.fromEntries(new FormData(form));
 const popup=window.open('about:blank','_blank');button.disabled=true;button.textContent='Cancelando…';$('#cancel-result').textContent='';
 try{const result=await api('/api/cancellations',{method:'POST',body:JSON.stringify(f)});showResult($('#cancel-result'),result.alreadyCancelled?'Esta reserva ya estaba cancelada.':'Reserva cancelada en la app. Se abre WhatsApp para avisar al restaurante.',result.id);openWhatsApp(popup,'Hola, he cancelado mi reserva en Tie Break.\nReferencia: '+result.id.slice(0,8)+'\nTeléfono: '+f.phone+'\nLa cancelación ya está registrada en la app.');}
 catch(error){if(popup&&!popup.closed)popup.close();$('#cancel-result').textContent=error.message;}finally{button.disabled=false;button.textContent='Cancelar reserva ↗';refreshAvailability();}
};

let availabilitySeq=0;
async function refreshAvailability(){const seq=++availabilitySeq;const f=$('#booking'),date=f.elements.date.value,area=f.elements.area.value,guests=Number(f.elements.guests.value),needed=Math.max(1,Math.ceil((guests-2)/2));
 if(!date)return;try{const data=await api('/api/availability?date='+encodeURIComponent(date)+'&time='+encodeURIComponent(f.elements.time.value));if(seq!==availabilitySeq)return;const zone=data.areas.find(a=>a.area===area);$('#availability').textContent=area+': '+zone.available+' de '+zone.total+' mesas disponibles de '+data.time+' a '+data.end+'. Tu grupo necesita '+needed+(needed===1?' mesa.':' mesas.')+(needed>zone.available?' Elige otra zona o fecha.':'');f.querySelector('button[type=submit]').disabled=needed>zone.available;}catch{if(seq===availabilitySeq)$('#availability').textContent='Comprobaremos las mesas disponibles al guardar la solicitud.';}}
for(const name of ['date','time','area','guests']){const field=$('#booking').elements[name];field.addEventListener('change',refreshAvailability);field.addEventListener('input',refreshAvailability);}
refreshAvailability();
