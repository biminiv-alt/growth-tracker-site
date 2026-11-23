/* tgp-share-v1: share buttons for guides and Growth Check results */
(function(){
  function ev(method, kind, id){
    try{ if(window.gtag) gtag('event','share',{method:method,content_type:kind,item_id:id}); }catch(e){}
    try{ if(window.fbq) fbq('trackCustom','Share',{method:method,content_type:kind,item_id:id}); }catch(e){}
  }
  function flash(btn, txt){
    var old = btn.getAttribute('data-label') || btn.textContent;
    btn.setAttribute('data-label', old);
    btn.textContent = txt;
    setTimeout(function(){ btn.textContent = old; }, 2200);
  }
  function copy(text, btn){
    function done(){ flash(btn, 'Copied'); }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done, function(){ fallback(); });
    } else { fallback(); }
    function fallback(){
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); done(); }catch(e){ window.prompt('Copy this link:', text); }
      document.body.removeChild(ta);
    }
  }
  function wire(box){
    var kind = box.getAttribute('data-kind') || 'guide';
    var id = box.getAttribute('data-id') || location.pathname;
    var nat = box.querySelector('[data-share="native"]');
    if(nat){
      if(navigator.share){ nat.style.display = ''; }
      nat.addEventListener('click', function(){
        var text = box.getAttribute('data-text') || '';
        var url = box.getAttribute('data-url-native');
        ev('native', kind, id);
        navigator.share({ title: box.getAttribute('data-title') || document.title, text: text, url: url }).catch(function(){});
      });
    }
    var cp = box.querySelectorAll('[data-share="copy"]');
    for(var i=0;i<cp.length;i++){
      (function(b){
        b.addEventListener('click', function(){
          ev('copy', kind, id);
          copy(b.getAttribute('data-copy') || box.getAttribute('data-url-copy'), b);
        });
      })(cp[i]);
    }
    var links = box.querySelectorAll('a[data-share]');
    for(var j=0;j<links.length;j++){
      (function(a){ a.addEventListener('click', function(){ ev(a.getAttribute('data-share'), kind, id); }); })(links[j]);
    }
  }
  window.tgpShareWire = wire;
  function init(){
    var boxes = document.querySelectorAll('.tgp-share[data-auto]');
    for(var i=0;i<boxes.length;i++) wire(boxes[i]);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
