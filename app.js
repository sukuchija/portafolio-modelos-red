document.addEventListener('DOMContentLoaded',()=>{const path=location.pathname.split('/').pop()||'index.html';document.querySelectorAll('.links a').forEach(a=>{if(a.getAttribute('href')===path)a.classList.add('active')});document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear())});


function switchVideoSource(type) {
  var nativeBox = document.getElementById('video-native-box');
  var ytBox = document.getElementById('video-youtube-box');
  var tabs = document.querySelectorAll('.source-tab');
  var iframe = document.getElementById('yt-iframe');
  
  if (type === 'native') {
    if (nativeBox) nativeBox.style.display = 'block';
    if (ytBox) ytBox.style.display = 'none';
    if (tabs.length >= 2) {
      tabs[0].classList.add('active');
      tabs[1].classList.remove('active');
    }
  } else {
    if (nativeBox) {
      nativeBox.style.display = 'none';
      var vid = nativeBox.querySelector('video');
      if (vid) vid.pause();
    }
    if (ytBox) {
      ytBox.style.display = 'block';
      if (iframe && (!iframe.src || iframe.src === 'about:blank' || iframe.src.indexOf('youtube') === -1)) {
        iframe.src = iframe.getAttribute('data-src') || 'https://www.youtube-nocookie.com/embed/Npxy5lsKq0U?rel=0&modestbranding=1';
      }
    }
    if (tabs.length >= 2) {
      tabs[0].classList.remove('active');
      tabs[1].classList.add('active');
    }
  }
}
window.switchVideoSource = switchVideoSource;
