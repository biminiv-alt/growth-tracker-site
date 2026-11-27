/* tgp-engage-v1: quick height check, measure-again reminder, saved last check, guide feedback.
   Runs on guide pages. Everything stays in the visitor's browser (localStorage); nothing is sent anywhere
   except anonymous Google Analytics events. */
(function(){
  if (window.__tgpEngage) return; window.__tgpEngage = 1;

  var CDC = {8:[0.45,127.6,0.0461],9:[0.35,132.9,0.0463],10:[0.25,138.1,0.0468],11:[0.20,143.3,0.0479],
    12:[0.20,149.1,0.0500],13:[0.20,156.0,0.0522],14:[0.20,163.2,0.0523],15:[0.20,169.0,0.0503],
    16:[0.20,173.5,0.0472],17:[0.20,175.9,0.0448],18:[0.20,176.8,0.0433]};
  var KEY = 'tgp_last_check';
  var path = location.pathname;

  function ev(name, p){ try{ if(window.gtag) gtag('event', name, p||{}); }catch(e){} }
  function normCdf(z){ var t=1/(1+0.2316419*Math.abs(z)), d=0.3989422804*Math.exp(-z*z/2);
    var p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274)))); return z>0?1-p:p; }
  function pct(cm, age){ var c=CDC[age]; var z=(Math.pow(cm/c[1],c[0])-1)/(c[0]*c[2]);
    return Math.max(0.1, Math.min(99.9, normCdf(z)*100)); }
  function ftin(cm){ var t=cm/2.54, f=Math.floor(t/12), i=Math.round((t-f*12)*2)/2; if(i>=12){f++;i=0;} return f+"'"+(i%1?i.toFixed(1):i)+'"'; }
  function ord(n){ var s=['th','st','nd','rd'], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){ return null; } }
  function save(o){ try{ localStorage.setItem(KEY, JSON.stringify(o)); }catch(e){} }
  function el(tag, attrs, html){ var e=document.createElement(tag); for(var k in (attrs||{})) e.setAttribute(k, attrs[k]); if(html!=null) e.innerHTML=html; return e; }
  function fmtDate(ts){ try{ return new Date(ts).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}); }catch(e){ return ''; } }

  var css = ''+
  '.tgpe{max-width:680px;margin:1.75rem auto;padding:1.2rem 1.3rem;border:1px solid #D9E3DE;background:#F3F8F5;border-radius:14px;box-sizing:border-box;font-family:Inter,system-ui,sans-serif;color:#1a2e26;line-height:1.5}'+
  '.tgpe h3{margin:0 0 .3rem;font-size:1.08rem;color:#1B4A3E;font-family:inherit}'+
  '.tgpe p{margin:0 0 .7rem;font-size:.95rem;color:#43525A}'+
  '.tgpe .row{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}'+
  '.tgpe select,.tgpe input{font:inherit;font-size:16px;padding:.55rem .6rem;border:1px solid #C9D3CE;border-radius:9px;background:#fff;color:#1a2e26;box-sizing:border-box}'+
  '.tgpe input{width:4.6rem}'+
  '@media (max-width:560px){.tgpe .row select{flex:1 1 100%}.tgpe .row input{flex:1 1 0;width:auto;min-width:0}.tgpe .row .go{flex:1 1 0}}'+
  '.tgpe button,.tgpe .btn{font:inherit;font-size:.95rem;font-weight:600;padding:.6rem 1.05rem;border-radius:9px;border:0;background:#1B4A3E;color:#fff;cursor:pointer;text-decoration:none;display:inline-block}'+
  '.tgpe .ghost{background:#fff;color:#1B4A3E;border:1px solid #1B4A3E}'+
  '.tgpe .res{display:none;margin-top:.9rem;padding-top:.9rem;border-top:1px solid #D9E3DE}'+
  '.tgpe .res.on{display:block}'+
  '.tgpe .big{font-size:1.5rem;font-weight:700;color:#1B4A3E;margin:0 0 .2rem}'+
  '.tgpe .bar{position:relative;height:8px;border-radius:4px;background:linear-gradient(90deg,#E8C9A8,#DDE8C8 25%,#BFDCCB 50%,#DDE8C8 75%,#E8C9A8);margin:.5rem 0 .9rem}'+
  '.tgpe .dot{position:absolute;top:-5px;width:18px;height:18px;margin-left:-9px;border-radius:50%;background:#1B4A3E;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.25)}'+
  '.tgpe ul{margin:.3rem 0 .8rem;padding-left:1.1rem}.tgpe li{margin:.3rem 0;font-size:.95rem}'+
  '.tgpe a{color:#1B4A3E;font-weight:500}'+
  '.tgpe .err{color:#A3402A;font-size:.88rem;margin:.4rem 0 0}'+
  '.tgpe .prev{background:#fff;border:1px dashed #C9D3CE;border-radius:9px;padding:.55rem .7rem;font-size:.9rem;margin:0 0 .8rem;color:#43525A}'+
  '.tgpe .small{font-size:.8rem;color:#6B777E;margin:.6rem 0 0}'+
  '.tgpe-fb{max-width:680px;margin:1.5rem auto;text-align:center;font-family:Inter,system-ui,sans-serif;color:#1a2e26}'+
  '.tgpe-fb button{font:inherit;font-size:.92rem;padding:.45rem 1rem;margin:0 .25rem;border-radius:999px;border:1px solid #C9D3CE;background:#fff;color:#1B4A3E;cursor:pointer}'+
  '.tgpe-fb p{margin:.4rem 0;font-size:.95rem}.tgpe-fb ul{list-style:none;padding:0;margin:.5rem 0}.tgpe-fb li{margin:.35rem 0}.tgpe-fb a{color:#1B4A3E}'+
  '.tgpe-cl label{display:flex;gap:.55rem;align-items:flex-start;padding:.45rem .1rem;font-size:.95rem;color:#1a2e26;cursor:pointer;border-bottom:1px solid #E3EBE7}'+
  '.tgpe-cl label:last-of-type{border-bottom:0}.tgpe-cl input[type=checkbox]{width:1.15rem;height:1.15rem;margin:.15rem 0 0;flex:0 0 auto;accent-color:#1B4A3E}'+
  '.tgpe-cl .grp{font-weight:600;font-size:.88rem;color:#6B777E;margin:.8rem 0 .1rem;text-transform:uppercase;letter-spacing:.03em}'+
  '.tgpe-sb{display:none}'+
  '@media (max-width:700px){.tgpe-sb{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:9990;align-items:center;gap:.6rem;padding:.6rem .75rem calc(.6rem + env(safe-area-inset-bottom));background:#1B4A3E;color:#fff;font-family:Inter,system-ui,sans-serif;font-size:.9rem;line-height:1.3;box-shadow:0 -2px 10px rgba(0,0,0,.18);transform:translateY(110%);transition:transform .25s ease}'+
  '.tgpe-sb.on{transform:none}.tgpe-sb .t{flex:1 1 auto;min-width:0}.tgpe-sb .t b{display:block;font-size:.95rem}'+
  '.tgpe-sb a.go{flex:0 0 auto;background:#fff;color:#1B4A3E;font-weight:700;text-decoration:none;padding:.55rem .85rem;border-radius:9px;font-size:.9rem;white-space:nowrap}'+
  '.tgpe-sb button.x{flex:0 0 auto;background:transparent;border:0;color:#fff;opacity:.8;font-size:1.3rem;line-height:1;padding:.2rem .3rem;cursor:pointer}}';

  function addCss(){ var s=el('style',{'data-tgpe':'1'}); s.textContent=css; document.head.appendChild(s); }

  function pageAge(){ var m=path.match(/(\d{1,2})-year-old/); if(m){ var a=+m[1]; if(CDC[a]) return a; } return null; }

  /* ---------- Measure-again reminder (no email: a calendar entry the parent adds) ---------- */
  function reminderHtml(){
    var d=new Date(); d.setDate(d.getDate()+91);
    var ymd=function(x){ return x.getFullYear()+String(x.getMonth()+1).padStart(2,'0')+String(x.getDate()).padStart(2,'0'); };
    var d2=new Date(d.getTime()+86400000);
    var title='Measure his height again (The Growth Path)';
    var details='Same time of day, shoes off, heels against a wall. Then see if his percentile moved: https://thegrowthpath.app/growth-check/?utm_source=reminder&utm_medium=calendar';
    var g='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(title)+'&dates='+ymd(d)+'/'+ymd(d2)+'&details='+encodeURIComponent(details);
    return '<p style="margin:.2rem 0 .5rem;font-weight:600;color:#1B4A3E">Growth shows up over months, not in one number.</p>'+
      '<p style="margin:0 0 .6rem">Set a reminder to measure him again in 3 months and see if his percentile holds.</p>'+
      '<div class="row"><a class="btn ghost" data-tgpe-rem="google" href="'+g+'" target="_blank" rel="noopener">Add to Google Calendar</a>'+
      '<a class="btn ghost" data-tgpe-rem="ics" href="#">Apple / Outlook calendar</a></div>';
  }
  function wireReminder(root){
    var g=root.querySelector('[data-tgpe-rem="google"]'); if(g) g.addEventListener('click',function(){ ev('measure_reminder',{type:'google',page:path}); });
    var a=root.querySelector('[data-tgpe-rem="ics"]'); if(!a) return;
    a.addEventListener('click',function(e){
      e.preventDefault(); ev('measure_reminder',{type:'ics',page:path});
      var d=new Date(); d.setDate(d.getDate()+91);
      var ymd=d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');
      var now=new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
      var ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//The Growth Path//Reminder//EN','BEGIN:VEVENT',
        'UID:tgp-'+Date.now()+'@thegrowthpath.app','DTSTAMP:'+now,'DTSTART;VALUE=DATE:'+ymd,
        'SUMMARY:Measure his height again (The Growth Path)',
        'DESCRIPTION:Same time of day\\, shoes off\\, heels against a wall. Then see if his percentile moved: https://thegrowthpath.app/growth-check/?utm_source=reminder&utm_medium=calendar',
        'BEGIN:VALARM','TRIGGER:PT9H','ACTION:DISPLAY','DESCRIPTION:Measure his height again','END:VALARM',
        'END:VEVENT','END:VCALENDAR'].join('\r\n');
      var blob=new Blob([ics],{type:'text/calendar'}); var u=URL.createObjectURL(blob);
      var l=document.createElement('a'); l.href=u; l.download='measure-his-height.ics'; document.body.appendChild(l); l.click();
      setTimeout(function(){ URL.revokeObjectURL(u); l.remove(); },1500);
    });
  }

  /* ---------- Quick height check ---------- */
  function quickCheck(){
    if (document.querySelector('input[type="number"], #calcBtn, .tgpe')) return; // page already has a tool
    var main=document.querySelector('main')||document.body;
    var anchor=main.querySelector('.inline-cta');
    if(!anchor){ var h2=main.querySelectorAll('h2'); anchor = h2.length>1 ? h2[1].previousElementSibling : (main.querySelector('.lede')||h2[0]); }
    if(!anchor) return;

    var prev=load(), pa=pageAge();
    var opts='<option value="">Age</option>'; for(var a=8;a<=18;a++) opts+='<option value="'+a+'">'+a+' years old</option>';
    var box=el('aside',{'class':'tgpe tgpe-qc','aria-label':'Quick height check'},
      '<h3>Quick check: where is he right now?</h3>'+
      '<p>Enter his age and height. You will see his CDC percentile in one second. Nothing is sent or saved anywhere but your own browser.</p>'+
      (prev?'<div class="prev">Last time ('+fmtDate(prev.t)+'): '+ftin(prev.cm)+' at age '+prev.age+', '+ord(Math.round(prev.p))+' percentile. Measured him again? Enter his new height below.</div>':'')+
      '<div class="row"><select aria-label="His age" class="a">'+opts+'</select>'+
      '<input type="number" inputmode="numeric" class="f" min="3" max="7" placeholder="ft" aria-label="Height feet">'+
      '<input type="number" inputmode="decimal" class="i" min="0" max="11.5" step="0.5" placeholder="in" aria-label="Height inches">'+
      '<button type="button" class="go">Check</button></div><p class="err" role="alert"></p>'+
      '<div class="res" aria-live="polite"></div>');
    anchor.parentNode.insertBefore(box, anchor.nextSibling);
    var sel=box.querySelector('.a'); if(pa) sel.value=pa; else if(prev && CDC[prev.age]) sel.value=prev.age;
    var seen=false;
    if('IntersectionObserver' in window){ new IntersectionObserver(function(es,o){ es.forEach(function(x){ if(x.isIntersecting&&!seen){ seen=true; ev('quick_check_view',{page:path}); o.disconnect(); } }); }).observe(box); }

    box.querySelector('.go').addEventListener('click', function(){
      var err=box.querySelector('.err'), age=+sel.value, f=parseFloat(box.querySelector('.f').value), i=parseFloat(box.querySelector('.i').value)||0;
      if(!age){ err.textContent='Pick his age first.'; return; }
      if(!(f>=3&&f<=7)||i<0||i>=12){ err.textContent='Enter his height in feet and inches, for example 4 ft 10 in.'; return; }
      err.textContent='';
      var cm=(f*12+i)*2.54, p=pct(cm,age), pr=Math.round(p);
      var msg;
      var q=pr;
      if(q>=75) msg='He is taller than about '+pr+' of every 100 boys his age.';
      else if(q>=25) msg='He is right in the normal middle range for his age.';
      else if(q>=10) msg='He is on the shorter side, still well within the normal range.';
      else if(q>=3) msg='He is shorter than most boys his age. That is very often a late bloomer, or a boy who is short like his family. The Growth Check adds both parents’ heights to tell which.';
      else msg='He is below the 3rd percentile. That is worth mentioning to his pediatrician, especially if he has dropped percentiles over time.';
      var change='';
      if(prev && prev.age<=age && Date.now()-prev.t>45*86400000){
        var dIn=(cm-prev.cm)/2.54, months=(Date.now()-prev.t)/(30.44*86400000), dp=pr-Math.round(prev.p);
        change='<div class="prev">Since '+fmtDate(prev.t)+': '+(dIn>=0?'+':'')+dIn.toFixed(1)+' in over '+Math.round(months)+' months ('+(dIn*12/months).toFixed(1)+' in a year), percentile '+(dp===0?'steady':(dp>0?'up ':'down ')+Math.abs(dp))+'. A steady percentile is the reassuring pattern. <a href="/son-not-growing-much/">When slow growth is worth a look</a>.</div>';
      }
      var links='<ul>'+
        '<li><a href="/growth-check/?age='+age+'&ft='+f+'&in='+i+'&utm_source=quick-check&utm_medium=onsite&utm_content='+encodeURIComponent(path)+'" data-tgpe="gc">See his likely adult height range with both parents’ heights</a> (2 minutes, his numbers already filled in)</li>'+
        '<li><a href="/average-height-'+age+'-year-old-boy/">Full height chart for '+age+'-year-old boys</a></li>'+
        (q<25?'<li><a href="/articles/is-my-son-a-late-bloomer/">Is he a late bloomer? The signs to look for</a></li>':'<li><a href="/articles/how-tall-will-my-son-be/">How tall will he be? The 3 ways to estimate it</a></li>')+
        (q<3?'<li><a href="/when-to-see-pediatric-endocrinologist-growth/">When to ask about a growth specialist</a></li>':'')+
        '</ul>';
      var res=box.querySelector('.res');
      res.innerHTML='<p class="big">'+ord(pr)+' percentile</p><p style="margin:0">'+ftin(cm)+' at age '+age+'. '+msg+'</p>'+
        '<div class="bar"><span class="dot" style="left:'+Math.max(2,Math.min(98,p))+'%"></span></div>'+change+
        '<a class="btn" data-tgpe="gc2" href="/growth-check/?age='+age+'&ft='+f+'&in='+i+'&utm_source=quick-check&utm_medium=onsite&utm_content='+encodeURIComponent(path)+'">Finish his Growth Check</a>'+
        links+'<div style="margin-top:.4rem">'+reminderHtml()+'</div>'+
        '<p class="small">One measurement is a snapshot. The trend over 6 to 12 months tells you far more. Based on CDC growth charts. Not medical advice.</p>';
      res.classList.add('on'); wireReminder(res);
      var gl=res.querySelectorAll('[data-tgpe]'); for(var k=0;k<gl.length;k++) gl[k].addEventListener('click',function(){ ev('quick_check_to_growth_check',{page:path,age:age}); });
      save({age:age, cm:Math.round(cm*10)/10, p:Math.round(p*10)/10, t:Date.now()});
      ev('quick_check_complete',{page:path, age:age, percentile:pr, returning: prev?1:0});
    });
  }

  /* ---------- Was this helpful? ---------- */
  function feedback(){
    var main=document.querySelector('main'); if(!main) return;
    var more=document.querySelector('.tgp-more');
    var box=el('div',{'class':'tgpe-fb'},'<p style="font-weight:600">Was this guide helpful?</p><button type="button" data-v="yes">Yes</button><button type="button" data-v="no">Not really</button><div class="out"></div>');
    if(more) more.parentNode.insertBefore(box, more); else main.appendChild(box);
    box.addEventListener('click', function(e){
      var b=e.target.closest('button[data-v]'); if(!b) return;
      var v=b.getAttribute('data-v'); ev('guide_feedback',{value:v,page:path});
      var out=box.querySelector('.out'); var btns=box.querySelectorAll('button'); for(var j=0;j<btns.length;j++) btns[j].style.display='none';
      if(v==='yes'){ out.innerHTML='<p>Thank you. If a friend is worrying about the same thing, this guide might help them too.</p>'; }
      else { out.innerHTML='<p>Sorry about that. What were you trying to find out?</p><ul>'+
        '<li><a href="/articles/is-my-son-short-for-his-age/" data-q="short">Is he short for his age?</a></li>'+
        '<li><a href="/articles/how-tall-will-my-son-be/" data-q="adult">How tall will he end up?</a></li>'+
        '<li><a href="/articles/is-my-son-a-late-bloomer/" data-q="bloomer">Is he a late bloomer?</a></li>'+
        '<li><a href="/articles/when-do-boys-stop-growing/" data-q="stop">When will he stop growing?</a></li>'+
        '<li><a href="/when-to-see-pediatric-endocrinologist-growth/" data-q="doctor">Should he see a doctor about it?</a></li></ul>';
        out.addEventListener('click',function(x){ var a=x.target.closest('a[data-q]'); if(a) ev('guide_feedback_route',{to:a.getAttribute('data-q'),page:path}); });
      }
    });
  }

  /* ---------- Engaged read signal (for measuring) ---------- */
  function readSignal(){
    var t0=Date.now(), done=false;
    function chk(){ if(done) return; var h=document.documentElement, sc=(window.scrollY+window.innerHeight)/Math.max(1,h.scrollHeight);
      if(sc>0.6 && Date.now()-t0>40000){ done=true; ev('guide_read',{page:path}); window.removeEventListener('scroll',chk); } }
    window.addEventListener('scroll',chk,{passive:true}); setInterval(chk,10000);
  }

  /* ---------- Tick-box checklists on key guides (tgp-checklist-v1). Wording follows each guide. ---------- */
  var LISTS = {
    spurt: { pages:['/signs-growth-spurt-coming-boys/','/articles/growth-spurts-in-boys-what-to-expect/'], before:/usual order|how to track/i,
      title:'Which signs have you noticed?', intro:'Tick what you have seen in the last few months.',
      items:[['feet','His feet have grown a lot (new shoe sizes)'],['hungry','He is always hungry'],['fill','He has filled out a little'],['odor','Body odor or oily skin'],['hair','First pubic or underarm hair'],['sleep','He sleeps more and later'],['clumsy','He is clumsier, or has leg aches at night'],['voice','His voice has started to crack']],
      result:function(t){ var n=t.length;
        if (t.indexOf('voice')>=0 || n>=5) return ['He may be in or near his fastest growth','Voice change usually overlaps with the peak, when many boys grow 3 to 4 inches in a year. Measure him now so you can see it happen.'];
        if (n>=2) return ['Looks like puberty may be under way','The fastest growth usually comes about 1.5 to 2 years after the first signs, most often between 13 and 15. A measurement now gives you a starting point.'];
        return ['Probably not started yet','The first signs most moms notice are bigger feet, a bigger appetite and body odor. Before puberty, boys grow about 2 to 2.5 inches a year. Measure him now so you have a baseline.']; } },
    bloomer: { pages:['/articles/signs-of-late-bloomer-boy/','/articles/is-my-son-a-late-bloomer/'], before:/might not|not just|what to (actually )?do/i,
      title:'Does this sound like him?', intro:'Tick each one that fits. Nothing is saved anywhere except this browser.',
      items:[['steady','He is shorter than his friends but still growing about 2 to 2.5 inches a year'],['family','Dad, an uncle or a grandfather grew late'],['math','Family-height math says he should end up average or taller'],['bone','A bone age X-ray read younger than his real age']],
      flags:[['slow','He has grown under 2 inches in the last year, before puberty'],['drop','He has been dropping percentile lines over time'],['none14','He is past 14 with no signs of puberty']],
      result:function(t){
        if (t.indexOf('slow')>=0||t.indexOf('drop')>=0||t.indexOf('none14')>=0) return ['Worth raising with his pediatrician','The guide lists these as signs to ask about a pediatric endocrinologist referral rather than wait and see.','doc'];
        if (t.length>=2) return ['That matches the late bloomer pattern','Short but growing normally, often with a family history. The Growth Check uses both parents’ heights to show where he is likely headed.'];
        return ['Not enough to tell yet','The key is steady growth. Measure him now and again in three months, and ask dad’s side when they grew.']; } }
  };
  function checklist(){
    var key=null; for (var k in LISTS){ if (LISTS[k].pages.indexOf(path)>=0) key=k; }
    if (!key) return;
    var L=LISTS[key], SK='tgp_cl_'+key, saved=[]; try{ saved=JSON.parse(localStorage.getItem(SK)||'[]')||[]; }catch(e){}
    var h2s=[].slice.call(document.querySelectorAll('main h2, article h2, h2')), at=null;
    for (var i=0;i<h2s.length;i++){ if (L.before.test(h2s[i].textContent)) { at=h2s[i]; break; } }
    if (!at && h2s.length>2) at=h2s[2]; if (!at) return;
    function box(it){ return '<label><input type="checkbox" value="'+it[0]+'"'+(saved.indexOf(it[0])>=0?' checked':'')+'><span>'+it[1]+'</span></label>'; }
    var html='<h3>'+L.title+'</h3><p>'+L.intro+'</p>'+L.items.map(box).join('')+
      (L.flags?'<p class="grp">Any of these?</p>'+L.flags.map(box).join(''):'')+
      '<div class="row" style="margin-top:.8rem"><button type="button" class="go">See what it means</button></div><div class="res"></div>';
    var root=el('div',{'class':'tgpe tgpe-cl','data-tgpe-cl':key},html);
    at.parentNode.insertBefore(root, at);
    var seen=false; if('IntersectionObserver' in window){ var io=new IntersectionObserver(function(e){ if(e[0].isIntersecting&&!seen){ seen=true; ev('checklist_view',{list:key,page:path}); io.disconnect(); } }); io.observe(root); }
    function ticks(){ return [].slice.call(root.querySelectorAll('input:checked')).map(function(x){return x.value;}); }
    function show(track){
      var t=ticks(); try{ localStorage.setItem(SK, JSON.stringify(t)); }catch(e){}
      var r=L.result(t), out=root.querySelector('.res');
      var last=load(), q='';
      if (last && last.age && last.cm){ var tot=last.cm/2.54, f=Math.floor(tot/12), n=Math.round(tot-f*12); if(n>=12){f++;n=0;} q='age='+last.age+'&ft='+f+'&in='+n+'&'; }
      var gc='/growth-check/?'+q+'utm_source=checklist-'+key+'&utm_medium=onsite&utm_content='+encodeURIComponent(path);
      out.innerHTML='<p class="big" style="font-size:1.2rem">'+r[0]+'</p><p>'+r[1]+'</p>'+
        (r[2]==='doc'?'<p><a href="/when-to-see-pediatric-endocrinologist-growth/">When to see a pediatric endocrinologist about growth</a></p>':'')+
        '<p><a class="btn" data-tgpe="clgc" href="'+gc+'">Take the free Growth Check</a></p>'+reminderHtml()+
        '<p class="small">Parent education, not medical advice. If you are worried, ask his pediatrician.</p>';
      out.classList.add('on'); wireReminder(out);
      out.querySelector('[data-tgpe="clgc"]').addEventListener('click',function(){ ev('checklist_to_growth_check',{list:key,page:path}); });
      if (track) ev('checklist_complete',{list:key,page:path,ticked:t.length,result:r[0]});
    }
    root.querySelector('button.go').addEventListener('click',function(){ show(true); });
    if (saved.length) show(false);
  }

  /* ---------- Phone sticky Growth Check bar (tgp-sticky-v1) ---------- */
  function stickyBar(){
    if (!window.matchMedia || !window.matchMedia('(max-width:700px)').matches) return;
    var SK='tgp_sticky_closed';
    try{ var c=+localStorage.getItem(SK)||0; if(c && Date.now()-c < 3*864e5) return; }catch(e){}
    var last=load(), href, txt;
    if (last && last.age && last.cm){
      var tot=last.cm/2.54, f=Math.floor(tot/12), i=Math.round(tot-f*12); if(i>=12){f++;i=0;}
      href='/growth-check/?age='+last.age+'&ft='+f+'&in='+i+'&utm_source=sticky&utm_medium=onsite&utm_content='+encodeURIComponent(path);
      txt='<b>See his likely adult height</b>His numbers are already filled in';
    } else {
      href='/growth-check/?utm_source=sticky&utm_medium=onsite&utm_content='+encodeURIComponent(path);
      txt='<b>Is he on track for his age?</b>Free 2-minute Growth Check';
    }
    var bar=el('div',{'class':'tgpe-sb','role':'complementary','aria-label':'Growth Check'},
      '<span class="t">'+txt+'</span><a class="go" href="'+href+'">Check now</a><button class="x" type="button" aria-label="Close">&times;</button>');
    document.body.appendChild(bar);
    var shown=false, closed=false, t0=Date.now();
    function inView(sel){ var n=document.querySelectorAll(sel); for(var k=0;k<n.length;k++){ var r=n[k].getBoundingClientRect(); if(r.bottom>0 && r.top<window.innerHeight) return true; } return false; }
    function upd(){
      if(closed) return;
      var h=document.documentElement, y=window.scrollY, H=Math.max(1,h.scrollHeight-window.innerHeight), frac=y/H;
      var want = y>500 && frac<0.92 && (Date.now()-t0>8000 || frac>0.25) && !inView('.tgpe, .inline-cta, .tgp-kit-link, form, input:focus, footer');
      if(want!==shown){ shown=want; bar.classList.toggle('on',want); if(want && !bar.__seen){ bar.__seen=1; ev('sticky_view',{page:path}); } }
    }
    window.addEventListener('scroll',upd,{passive:true}); window.addEventListener('resize',upd); setInterval(upd,2000);
    bar.querySelector('a.go').addEventListener('click',function(){ ev('sticky_click',{page:path, saved: last?1:0}); });
    bar.querySelector('button.x').addEventListener('click',function(){ closed=true; bar.classList.remove('on'); try{ localStorage.setItem(SK,String(Date.now())); }catch(e){} ev('sticky_close',{page:path}); });
  }

  function init(){ try{ addCss(); checklist(); quickCheck(); feedback(); readSignal(); stickyBar(); }catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
