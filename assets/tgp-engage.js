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
  '.tgpe-fb p{margin:.4rem 0;font-size:.95rem}.tgpe-fb ul{list-style:none;padding:0;margin:.5rem 0}.tgpe-fb li{margin:.35rem 0}.tgpe-fb a{color:#1B4A3E}';

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

  function init(){ try{ addCss(); quickCheck(); feedback(); readSignal(); }catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
