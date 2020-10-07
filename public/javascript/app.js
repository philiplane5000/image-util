$(document).ready(() => {
  // UNIVERSAL Regular Expression patterns:
  const regEx = {
    filepath: /^([a-zA-Z]\:[\\])?(fakepath)?(\\)?([a-zA-Z-]+)\.(jpg)$/gm,
    dimension: /^[0-9]{1,5}/gm,
  }
  // ***begins********* ASPECT-RATIO-LOCK FUNCTIONALITY *************** //
  let calcHeight = (width, ratio = "16:9") => {
    let aspectWidth = ratio.split(":")[0]; /* (eg) '16' */
    let aspectHeight = ratio.split(":")[1]; /* (eg) '9' */
    return Math.round((width / aspectWidth) * aspectHeight);
  };

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
        $inputTarget
          .closest(".form-group")
          .find('[name$="Height"]')
          .val(height);
        //  (^) set the height value on the nearest [name*=Height] input
      });
    });
  };

  let unlockAspectRatio = (e) => {
    $('[name$="Height"]').removeAttr("disabled");
    // $('[name$="Height"]').val("");
  };
  // ***ends*********** ASPECT-RATIO-LOCK FUNCTIONALITY *************** //

  // ***begins********* UPLOAD DATA FUNCTIONALITY ********************* //
  let updateLabel = (e) => {
    let fileName = $(e.target).val();
    $(e.target).next('.custom-file-label').html(fileName);
  }

  let renderMetadata = (metadata) => {
    $("#loader-gif").addClass("d-none");
    $("#s3-results-section").removeClass("d-none");

    for (data of metadata) {
      let { Bucket, ETag, Key, Location } = data;
      let [ input, path, dims, size, mime ] = /^(\d+\/\d{2}\/\d{2}\/[a-zA-Z-]+)\.(\d+x\d+)\.(lg|md|sm|xs)\.(jpg|png)/.exec(Key);
      let [ original , name ] = /\d+\/\d+\/\d+\/([\w\-]+)/.exec(path);
      size = size.toUpperCase();

      // Remove enclosing quotation marks from ETag for HTML ease of use:
      ETag = ETag.replace(/\"+/g, '');

      const $s3Data = $(`
        <div class="col-sm-6 s3-result-card mb-2">
          <a 
            href="${Location}"
            data-bucket="${Bucket}"
            data-etag="${ETag}"
            data-location="${Location}"
            data-key="${Key}"
            target="_blank"
            class="list-group-item list-group-item-success list-group-item-action s3-result-item"
            style="text-transform: uppercase; font-size:20px;"
          >
            Success: <img src="/icons/box-arrow-up-right.svg" alt="external-link">
          </a>
          <ul class="list-group">
            <li class="list-group-item  d-flex justify-content-between align-items-center">
              <button class="btn-clipboard btn-${name}-${size}" data-clipboard-target='#${name}-${size}'>
                <img src="../icons/add-to-clipboard.png" alt="Copy to clipboard" height="30px">              
              </button>
              <pre class="target-path" id="${name}-${size}" value="${path}">${path}</pre>
            </li>
            <li class="list-group-item">
              <strong>Bucket:</strong> ${Bucket}
            </li>
            <li class="list-group-item d-flex justify-content-between">
              <span><strong>Dimensions:</strong> ${dims}px</span>
              <span>${size.toUpperCase()}</span>
            </li>
            <!-- <li class="list-group-item d-flex justify-content-between align-items-center">
              <span style="flex: 10%;"><strong>URL:</strong></span>
              <a href="${Location}" style="font-size: 12px; flex: 90%;">${Location}</a>
            </li> -->
          </ul>
        </div>
      `);

      $("#s3-results-section").append($s3Data);
      $("#upload-submit").hide();
      $("#upload-manage").removeClass("d-none");
      clipboard(`.btn-${name}-${size}`);
    }
  };

  let uploadToS3 = (e) => {
    e.preventDefault();
    // get the image filename and any other pertinent metadata
    $("#loader-gif").removeClass("d-none");
    $("#sharp-results-section").addClass("d-none");

    const uploads = [];
    const imageResultItems = $(".image-result-item");

    $.each(imageResultItems, (i, result) => {
      const imgData = {
        filename: $(result).data("filename"),
        format: $(result).data("format"),
        size: $(result).data("size"),
      };
      uploads.push(imgData);
    });

    console.log("uploads :>> ", JSON.stringify(uploads));

    $.ajax({
      url: "/upload/s3",
      type: "POST",
      data: JSON.stringify({ Uploads: uploads }),
      // dataType: 'json',
      contentType: "application/json",
      success: renderMetadata,
      error: function (err) {
        console.log("err: ", err);
      },
      // context: document.body
    });
    // POST image metadata to /upload route via request body
  };
  // ***ends*********** UPLOAD DATA FUNCTIONALITY ********************* //
  
  // ***begins********* MANAGE-S3 FUNCTIONALITY *********************** //
  let renderObjectsS3 = (data) => {
    $("#loader-gif").addClass("d-none");
    $("#loader-gif").addClass("d-none");
    $("#no-results-msg").addClass("d-none");

    if (data.Contents.length > 0) {
      data.Contents.forEach((obj) => {
        let { Key, LastModified, ETag, Size, StorageClass } = obj;
        let imgSrc = `https://gempeg-poc.s3.us-east-1.amazonaws.com/${Key}`;
        let [ input, path, dims, size, mime ] = /^(\d+\/\d{2}\/\d{2}\/[a-zA-Z-]+)\.(\d+x\d+)\.(lg|md|sm|xs)\.(jpg|png)/.exec(Key);
        let [ original , name ] = /\d+\/\d+\/\d+\/([\w\-]+)/.exec(path);
        size = size.toUpperCase();

        // Remove enclosing quotation marks from ETag for HTML ease of use:
        ETag = ETag.replace(/\"+/g, '');

        let card = `
          <div class="col-sm-3 mb-3 mt-3">
            <div class="card">
              <img class="card-img-top" src="${imgSrc}" alt="${Key}">
              <ul class="list-group list-group-flush">
                <li class="list-group-item  d-flex justify-content-between align-items-center">
                  <button class="btn-clipboard btn-${name}-${size}" data-clipboard-target='#${name}-${size}'>
                    <img src="icons/add-to-clipboard.png" alt="Copy to clipboard" height="30px">
                  </button>          
                  <pre class="target-path" id="${name}-${size}" value="${path}">${path}</pre>                                 
                </li>
                <li class="list-group-item">
                  <strong>Dimensions:</strong> ${dims}px
                </li>
                <li class="list-group-item d-flex justify-content-between">
                  <span><strong>Size:</strong> ${Size} (B)</span>
                  <span>${size}</span>
                </li>
              </ul>
              <div class="card-body d-flex justify-content-between align-items-center">
                <a href="${imgSrc}" class="card-link">Download</a>
                <a href="#" class="card-link card-link-delete" data-key="${Key}" data-tag="${ETag}">Delete</a>
              </div>
            </div>
          </div>
        `;

        $(".s3-result-cards").append(card);
        clipboard(`.btn-${name}-${size}`);
      });
    } else {
      $("#no-results-msg").removeClass("d-none");
    }
  };

  let listObjectsS3 = (e) => {
    e.preventDefault();
    const date = $('[name="date"]').val().split("-");
    const yyyy = date[0];
    const mm = date[1];
    const dd = date[2];
    const filename = $('[name="filename"]').val().trim();
    const filecheck = $('[name="filecheck"]').is(":checked");

    $(".s3-result-cards").html("");
    $("#loader-gif").removeClass("d-none");

    $.ajax({
      url: `/api/list/${yyyy}/${mm}/${dd}/${filecheck ? filename : ""}`,
      type: "GET",
      success: renderObjectsS3,
      error: function (err) {
        console.log("err: ", err);
      },
    });
  };

  let deleteObjectS3 = (e) => {
    e.preventDefault();
    let $parentCard = $(e.target).closest(".card");
    let $imgTop = $parentCard.find(".card-img-top");
    let key = $(e.target).data("key");

    $.ajax({
      url: `/api/object?key=${key}`,
      type: "DELETE",
      success: function (data) {
        $imgTop.css({ filter: "grayscale()" });
        $parentCard.addClass("fade-out");
        setTimeout(() => {
          $(e.target).closest(".card").remove();
        }, 500);
      },
      error: function (err) {
        alert("ERROR: ", err);
      },
    });
  };

  let resetForm = (e) => {
    e.preventDefault();
    $('[name="date"]').val("");
    $('[name="filename"]').val("");
    if ($('[name="filecheck"]').is(":checked")) {
      $('[name="filecheck"]').prop("checked", false);
    }
    $(".s3-result-cards").html("");
  }
  // ***end************ MANAGE-S3 FUNCTIONALITY *********************** //

  // ***begins*********** MISC / UTILS ******************************** //
  let clipboard = (selector) => {
    new ClipboardJS(selector)
  }

  let validate = (type, value) => {
    let regex = '';
    switch (type) {
      case 'email':
      regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gm
      break;
      case 'filepath':
      regex = /^([a-zA-Z]\:[\\])?(fakepath)?(\\)?([a-zA-Z-]+)\.(jpg)/gm;
      break;
    }
    return regex.test(value);
  }
  // ***ends*********** MISC / UTILS ********************************** //  

  // ASSIGN aspect ratio lock event listeners
  $('[name="aspect-lock"]').change((e) => {
    if ($(e.target).is(":checked")) {
      if ($(e.target).val() !== "0") {
        lockAspectRatio(e);
      } else {
        unlockAspectRatio(e);
      }
    }
  });

  $("#sharp-form").bind("submit", (e) => {
    // BEGIN Validation
    let flag = false;
    let filepath = $('#originalImg').val();
    if (regEx.filepath.test(filepath)) {
      flag = true;
    } else {
      console.error('Does not adhere to filename policy :>> ', filepath);
      $('#originalImg').focus();
      return false      
    }
    // END Validation
    
    // RE-ENABLE all disabled height inputs frozen
    $(":disabled").each((i, element) => {
      $(element).removeAttr("disabled");
    });

    return flag;
  });

  // UPLOAD resized images to S3 bucket
  $("#upload-form").bind("submit", uploadToS3);

  // BIND S3 listObjects method + render results on success
  $("#manage-form").bind("submit", listObjectsS3);

  // DELETE object/image from S3 bucket
  $(".s3-result-cards").on("click", ".card-link-delete", deleteObjectS3);

  // RESET manager search selections
  $('[name="reset"]').on("click", resetForm);

  // PRESELECT filename checkbox on manage dashboard
  $('[name="filecheck"]').prop('checked', true);

  // SHOW filename as label after user triggers via 'Browse'
  $('#originalImg').on('change', updateLabel);

});
