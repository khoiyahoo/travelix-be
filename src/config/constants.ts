export const VALIDATION = {
  password: /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])[a-zA-Z0-9!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]*$/,
  phone: /(((\+|)84)|0)(3|5|7|8|9)+([0-9]{8})\b/
}