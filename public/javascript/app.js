$(document).ready(() => {
  // ***begins********* ASPECT-RATIO-LOCK FUNCTIONALITY *************** //
  let lockAspectRatio = (e) => {
    let $checked = $(e.target);
    const AR = $checked.val();
    // DISABLE all height inputs
    $('[name$="Height"]').attr("disabled", "disabled");
  
    $('[name$="Width"]').each((i, el) => {
      // UPDATE all height values according to newly:checked aspect ratio
      let currentWidth = $(el).val();
      let height = calcHeight(currentWidth, AR);
      //  (^) take the EXISTING val() of width, apply calcHeight fn to determine height
      $(el).closest(".form-group").find('[name$="Height"]').val(height);
      //  (^) reset/update each of the nearest height input values according to new AR
  
      // ASSIGN new event listener to each width input for keyup which will,
      $(el).keyup((e) => {
        let $inputTarget = $(e.target);
        let newWidth = $inputTarget.val();
        let height = calcHeight(newWidth, AR);
        //  (^) take the NEW val() of width, apply calcHeight fn to determine height
        $inputTarget.closest(".form-group").find('[name$="Height"]').val(height);
        //  (^) set the height value on the nearest [name*=Height] input
      });
    });
  };
  
  let unlockAspectRatio = (e) => {
    $('[name$="Height"]').removeAttr("disabled");
    // $('[name$="Height"]').val("");
  };
  
  let calcHeight = (width, ratio = "16:9") => {
    let aspectWidth = ratio.split(":")[0]; /* (eg) '16' */
    let aspectHeight = ratio.split(":")[1]; /* (eg) '9' */
    return Math.round((width / aspectWidth) * aspectHeight);
  };
  // ***ends*********** ASPECT-RATIO-LOCK FUNCTIONALITY *************** //

  // ***begins********* UPLOAD DATA FUNCTIONALITY ********************* //
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
      url: "/upload/s3",
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
  // ***ends*********** UPLOAD DATA FUNCTIONALITY ********************* //

  // ***begins********* MANAGE-S3 FUNCTIONALITY *********************** //
  let renderObjects = (data) => {
    data.Contents.forEach(obj => {
      let { Key, LastModified, ETag, Size, StorageClass } = obj;
      let imgSrc = `https://image-upload-util.s3.us-west-1.amazonaws.com/${Key}`;
  
      let card = `
        <div class="col-sm-3">
          <div class="card">
            <img class="card-img-top" src="${imgSrc}" alt="${Key}">
            <ul class="list-group list-group-flush">
              <li class="list-group-item"><strong>Key:</strong> ${Key}</li>
              <li class="list-group-item"><strong>Size:</strong> ${Size}</li>
              <li class="list-group-item"><strong>LastModified:</strong> ${LastModified}</li>
              <li class="list-group-item"><strong>StorageClass:</strong> ${StorageClass}</li>
              <!-- <li class="list-group-item"><strong>ETag:<strong> ${ETag}</li> -->
            </ul>
            <div class="card-body d-flex justify-content-between align-items-center">
            <a href="${imgSrc}" class="card-link">Download</a>
            <a href="#" class="card-link card-link-delete" data-key="${Key}" data-tag=${ETag}>Delete</a>
            </div>
          </div>
        </div>
      `
  
      $('.s3-result-cards').append(card);
  
    })
  }
  
  let listObjectsS3 = (e) => {
    e.preventDefault();
    let prefix = $('[name="prefix"]').val();
  
    $.ajax({
      url: `/api/list?prefix=${prefix}`,
      type: "GET",
      success: renderObjects,
      error: function (err) {
        console.log('err: ', err)
      }      
    })
  }
  // ***end************ MANAGE-S3 FUNCTIONALITY *********************** //

  // ASSIGN aspect ratio lock event listeners
  $('[name="aspect-lock"]').change(function (e) {
    if ($(this).is(":checked")) {
      if ($(this).val() !== "0") {
        lockAspectRatio(e);
      } else {
        unlockAspectRatio(e);
      }
      console.log($(this).val());
    }
  });

  // RE-ENABLE all disabled height inputs frozen
  $('#sharp-form').bind('submit', function(e) {
    $(':disabled').each(function(e) {
        $(this).removeAttr('disabled');
    })
  })

  // UPLOAD resized images to S3 bucket
  $('#upload-form').bind('submit', uploadToS3);

  // BIND S3 listObjects method and render results on success
  $("#manage-form").bind('submit', listObjectsS3)

  // DELETE image (INDEV)
  $('.s3-result-cards').on('click', '.card-link-delete', (e) => {
    e.preventDefault();
    let data = { Key: $(e.target).data('key'), ETag: $(e.target).data('tag')};
    console.log('data: ', data);
    // .ajax() call to pass data for this image to a delete route (INDEV)
  })

});