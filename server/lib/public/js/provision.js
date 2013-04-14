(function() {
  "use strict";

  /*
   * The identity is the first 12 chars of the yubikey OTP token.
   *
   * For example, if the token is 'vvvvvvcurikvhjcvnlnbecbkubjvuittbifhndhn',
   * then the user's email is 'vvvvvvcurikvhj@gno.mn' and the identity is
   * 'vvvvvvcurikvhj'.
   */
  navigator.id.beginProvisioning(function(email, certDuration) {
    var identity = email.split('@')[0];

    /*
     * Inside the beginProvisioning callback, determine if the user actually
     * owns the given email address by checking for an active session with your
     * domain.
     */
    isAuthenticated(identity, function(result) {
      if (result.success) {
        navigator.id.genKeyPair(function(publicKey) {
          certifyKey(email, publicKey, certDuration, function(result) {
            if (!result.success) {
              // If the user does not have an active session associated with
              // the given email address, call
              // navigator.id.raiseProvisioningFailure() with an optional, but
              // recommended, error message at its first parameter. This causes
              // the browser to stop the provisioning process and instead show
              // the user your authentication page.
              return navigator.id.raiseProvisioningFailure(result.reason);
            }
            navigator.id.registerCertificate(result.certificate);
          });
        });
      }
      else {
        navigator.id.raiseProvisioningFailure('user is not authenticated as target user');
      }
    });
  });

  function isAuthenticated(identity, callback) {
    $.ajax({
      type: 'GET',
      url: '/identity',
      dataType: 'json',
      data: {
        identity: identity
      },
      success: callback
    });
  }

  function certifyKey(email, publicKey, duration, callback) {
    $.ajax({
      type: 'POST',
      url: '/cert_key',
      dataType: 'json',
      data: {
        email: email,
        publicKey: publicKey,
        duration: duration
      },
      success: callback
    });
  }
}());
