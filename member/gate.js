(function(){
  try {
    var auth = sessionStorage.getItem('tgp_member_auth');
    if (!auth) {
      window.location.href = '/member/login/';
    }
  } catch(e) {
    window.location.href = '/member/login/';
  }
})();
