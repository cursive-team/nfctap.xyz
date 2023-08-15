# wallet-test

This is a repository exploring adding emojisigs directly to Google and Apple Wallet.

## Apple Wallet

The main link that includes resources is: https://developer.apple.com/documentation/walletpasses. Roughly, the entire structure is defined in `pass.json`, and then we use a certificate to sign a `manifest.json` file that includes all the hashes of all the files in the pass. Then, we zip up the entire directory, and change the extension to `.pkpass`. We get this certificate from the Apple Developer Portal.

There's a repository that does this functionality in Node.js: https://github.com/tinovyatkin/pass-js/tree/master. There's another repository with an example structure: https://github.com/phatblat/phatblat.pass/tree/main. There's another useful tutorial that phatblat linked here: https://www.walletthat.com/help/creating-a-pass-type-id-pass-signing-certificate/

## Google Wallet

The main tutorial we are following to create a pass in Google Wallet is included here: https://codelabs.developers.google.com/add-to-wallet-web#0. The correspoding repository is kept at: https://github.com/google-pay/wallet-web-codelab/blob/main/web_complete/app.js. There is another example repository here: https://github.com/google-pay/wallet-samples/tree/main

There is also a notion of a "private pass" with additional security guarentees that we should visit if we deploy this at a larger scale: https://developers.google.com/wallet/generic-private-pass. I have applied for access to this and will keep this updated on our access policy.

### Helpful notes

We need to set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of the service account key file. This is the file that we download from the Google Cloud Console. Instructions are at https://cloud.google.com/docs/authentication/provide-credentials-adc#local-key
