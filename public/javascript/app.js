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
      success: renderMetadata,
      error: function (err) {
        console.log('err: ', err)
      }
      // context: document.body
    })
    // POST image metadata to /upload route via request body

  }

  let renderMetadata = (metadata) => {
    $('#s3-results-section').removeClass('d-none');
    for (data of metadata) {
      const {Bucket, ETag, Key, Location, key} = data;

      const $s3Data = $(`
      <div class="col-sm-6 s3-result-card">
        <a 
          href="${Location}"
          data-bucket="${Bucket}"
          data-etag="${ETag}"
          data-location="${Location}"
          data-key="${key}"
          target="_blank"
          class="list-group-item list-group-item-success list-group-item-action s3-result-item"
          style="text-transform: uppercase; font-size:20px;"
        >
          Success: <img src="/icons/box-arrow-up-right.svg" alt="external-link">
        </a>
        <ul class="list-group">
          <li class="list-group-item list-group-item-light">
            ETag: ${ETag}
          </li>
          <li class="list-group-item list-group-item-light">
            Bucket: ${Bucket}
          </li>
          <li class="list-group-item list-group-item-light">
            key: ${key}
          </li>
          <li class="list-group-item list-group-item-light">
            Location: ${Location}
          </li>
        </ul>
      </div>
      `)
  
      $('#s3-results-section').append($s3Data)
      $('#upload-form').hide()
    }


  }

  // potentially later use of below vals to display image preview:
  // $('.image-result-item').on('click', (e) => {
  //   console.log('format:', e.target.getAttribute('data-format'));
  //   console.log('width:', e.target.getAttribute('data-width'));
  //   console.log('height:', e.target.getAttribute('data-height'));
  //   console.log('size:', e.target.getAttribute('data-size'));
  //   console.log('filename:', e.target.getAttribute('data-filename'));
  // })

  $('#upload-form').bind('submit', uploadToS3);

});