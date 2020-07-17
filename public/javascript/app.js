$(document).ready(() => {

  let uploadToS3 = (e) => {
    e.preventDefault();
    // get the image filename and any other pertinent metadata
    const uploads = [];
    const imageResultItems = $('.image-result-item');

    $.each(imageResultItems, (i, result) => {  
      const imgData = {
        filename: $(result).data('filename'),
        format: $(result).data('format'),
        size: $(result).data('size')
      }
      uploads.push(imgData);
    })

    console.log('uploads: ', JSON.stringify(uploads));

    $.ajax({
      url: "/upload",
      type: "POST",
      data: JSON.stringify({ Uploads: uploads}),
      // dataType: 'json',
      contentType: 'application/json',
      success: function (data) {
        console.log('data: ', data)
      },
      error: function (err) {
        console.log('err: ', err)
      }
      // context: document.body
    })
    // POST image metadata to /upload route via request body

  }

  // potentially use these valuse later to display image preview
  $('.image-result-item').on('click', (e) => {
    console.log('format:', e.target.getAttribute('data-format'));
    console.log('width:', e.target.getAttribute('data-width'));
    console.log('height:', e.target.getAttribute('data-height'));
    console.log('size:', e.target.getAttribute('data-size'));
    console.log('filename:', e.target.getAttribute('data-filename'));
  })

  $('#upload-form').bind('submit', uploadToS3);

});