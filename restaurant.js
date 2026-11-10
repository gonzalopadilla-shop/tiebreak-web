const $=s=>document.querySelector(s);
const day=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Madrid'}).format(new Date());
const uid=()=>crypto.randomUUID();
async function api(path,options={}){const response=await fetch('https://tiebreak-restaurante.tiebreak-club-demo.workers.dev'+path,{credentials:'omit',cache:'no-store',...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});let data;try{data=await response.json()}catch{throw new Error('No se pudo contactar con el servidor. Inténtalo de nuevo.')}if(!response.ok)throw new Error(data.error||'No se ha podido completar la operación.');return data;}

const restaurantPhone='34663781595';
$('#booking [name=date]').min=day();$('#booking [name=date]').value=day();
let submissionKey=null,submissionPayload=null;
function setMode(cancel){$('#booking').hidden=cancel;$('#cancel-booking').hidden=!cancel;$('#show-reserve').setAttribute('aria-pressed',String(!cancel));$('#show-cancel').setAttribute('aria-pressed',String(cancel));}
$('#show-reserve').onclick=()=>setMode(false);$('#show-cancel').onclick=()=>setMode(true);
function openWhatsApp(popup,message){const url='https://wa.me/'+restaurantPhone+'?text='+encodeURIComponent(message);if(popup&&!popup.closed){popup.opener=null;popup.location.replace(url);}else location.assign(url);}
function showResult(target,text,id){target.textContent=text;const code=document.createElement('strong');code.className='reference-code';code.textContent='Referencia: '+id.slice(0,8);target.append(code);}
$('#booking').onsubmit=async e=>{
 e.preventDefault();const form=e.target,button=form.querySelector('button[type=submit]'),f=Object.fromEntries(new FormData(form));
 if(f.date<day()){ $('#booking-result').textContent='Elige hoy o una fecha futura.';return; }
 const payload=JSON.stringify(f);if(submissionPayload!==payload){submissionKey=uid();submissionPayload=payload;}
 const popup=window.open('about:blank','_blank');button.disabled=true;button.textContent='Guardando…';$('#booking-result').textContent='';
 try{const result=await api('/api/reservations',{method:'POST',body:JSON.stringify({...f,requestKey:submissionKey})});
 const date=f.date.split('-').reverse().join('/');const message='Hola, quiero solicitar una reserva en Tie Break.\nNombre: '+f.name+'\nFecha: '+date+'\nHora: '+f.time+'\nPersonas: '+f.guests+'\nZona: '+f.area+'\nTeléfono: '+f.phone+'\nPeticiones: '+(f.notes||'Sin peticiones')+'\nReferencia: '+result.id.slice(0,8)+'\n¿Podéis confirmarla?';
 showResult($('#booking-result'),'Solicitud guardada, pendiente de confirmación. Se abre WhatsApp con los datos preparados: pulsa Enviar para avisar al restaurante. Conserva tu referencia para cancelar.',result.id);
 $('#cancel-booking [name=reference]').value=result.id.slice(0,8);$('#cancel-booking [name=phone]').value=f.phone;
 form.reset();$('#booking [name=date]').value=day();submissionKey=null;submissionPayload=null;openWhatsApp(popup,message);
 }catch(error){if(popup&&!popup.closed)popup.close();$('#booking-result').textContent=error.message;}finally{button.disabled=false;button.textContent='Solicitar mesa ↗';}
};
$('#cancel-booking').onsubmit=async e=>{
 e.preventDefault();const form=e.target,button=form.querySelector('button[type=submit]'),f=Object.fromEntries(new FormData(form));
 const popup=window.open('about:blank','_blank');button.disabled=true;button.textContent='Cancelando…';$('#cancel-result').textContent='';
 try{const result=await api('/api/cancellations',{method:'POST',body:JSON.stringify(f)});showResult($('#cancel-result'),result.alreadyCancelled?'Esta reserva ya estaba cancelada.':'Reserva cancelada en la app. Se abre WhatsApp para avisar al restaurante.',result.id);openWhatsApp(popup,'Hola, he cancelado mi reserva en Tie Break.\nReferencia: '+result.id.slice(0,8)+'\nTeléfono: '+f.phone+'\nLa cancelación ya está registrada en la app.');}
 catch(error){if(popup&&!popup.closed)popup.close();$('#cancel-result').textContent=error.message;}finally{button.disabled=false;button.textContent='Cancelar reserva ↗';}
};
