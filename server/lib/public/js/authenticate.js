extends layout

block content
  form(method='post', action='/otp', name='form_authenticate')#form_authenticate.hidden
    label(for='otp') OTP
    input(type='text', name='otp', placeholder='vvvvvvcurikvhjcvnlnbecbkubjvuittbifhndhn')#otp
    button Submit

  p#success.hidden Success! You are now signed in.

  script(src='https://login.persona.org/authentication_api.js')
  script(src='js/sign_in.js')
