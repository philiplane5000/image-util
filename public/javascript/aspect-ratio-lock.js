// re-enable all disabled height inputs frozen
$('#sharp-form').submit(function(e) {
  $(':disabled').each(function(e) {
      $(this).removeAttr('disabled');
  })
});

$('[name="aspect-lock"]').change(function () {
  if ($(this).is(":checked")) {
    if ($(this).val() !== "0") {
      lockAspectRatio();
    } else {
      unlockAspectRatio();
    }
    console.log($(this).val());
  }
});

let lockAspectRatio = () => {
  // (1) update all height values according to selected aspect ratio

  // (2) disable all height inputs
  $('[name$="Height"]').attr("disabled", "disabled");

  // (3) assign a keyup(?) event to each width input which will upon keyup,
  $('[name$="Width"]').each((i, el) => {
    $(el).keyup((e) => {
      let $target = $(e.target);
      //  * deteremine the currently checked aspect ratio (eg) '16:9'
      let aspectRatio = $('[name="aspect-lock"]:checked').val();
      let currentWidth = $target.val();
      //  * take the current val() of width, apply aspect ratio function to determine the height
      let height = calcHeight(currentWidth, aspectRatio);
      //  * set the height value on the nearest [name*=Height] input
      $target.closest(".form-group").find('[name$="Height"]').val(height);
    });
  });
};

let unlockAspectRatio = () => {
  $('[name$="Height"]').removeAttr("disabled");
  $('[name$="Height"]').val("");
};

let calcHeight = (width, ratio = "16:9") => {
  let aspectWidth = ratio.split(":")[0]; /* (eg) '16' */
  let aspectHeight = ratio.split(":")[1]; /* (eg) '9' */
  return Math.round((width / aspectWidth) * aspectHeight);
};
