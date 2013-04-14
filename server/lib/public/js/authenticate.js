(function() {
  "use strict";

  navigator.id.beginAuthentication(function(email) {
    var identity = email.split('@')[0];
  });

  $('#form_authenticate').on('submit', function(evt) {
    evt.preventDefault();
    var otp = $('#otp').val().trim();
    $.ajax({
      type: 'POST',
      url: '/otp',
      data: {
        otp: otp
      },
      success: function(data) {
        if (data.success) {
          navigator.id.completeAuthentication();
        } else {
          console.error(data);
        }
      }
    });
  });
})();

