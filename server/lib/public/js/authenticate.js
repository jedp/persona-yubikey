(function() {
  "use strict";

  navigator.id.beginAuthentication(function(email) {
    var identity = email.split('@')[0];
  });

  $('#success').hide();

  $('#form_authenticate').on('submit', function(evt) {
    $('#success').text("Authenticating with Yubico ...").show();

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
          $('#success').text('YubiKey authentiction failed: ' + data.reason);
        }
      }
    });
  });
})();

