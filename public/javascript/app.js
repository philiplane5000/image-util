$(document).ready(() => {

  // potentially use these valuse later to display image preview
  $('.image-result-item').on('click', (e) => {
    console.log('format:', e.target.getAttribute('data-format'));
    console.log('width:', e.target.getAttribute('data-width'));
    console.log('height:', e.target.getAttribute('data-height'));
    console.log('size:', e.target.getAttribute('data-size'));
    console.log('filename:', e.target.getAttribute('data-filename'));
  })

})