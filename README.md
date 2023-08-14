# wallet-test

This is a repository exploring adding emojisigs directly to Google and Apple Wallet.

## Apple Wallet

The main link that includes resources is: https://developer.apple.com/documentation/walletpasses. Roughly, the entire structure is defined in `pass.json`, and then we use a certificate to sign a `manifest.json` file that includes all the hashes of all the files in the pass. Then, we zip up the entire directory, and change the extension to `.pkpass`. We get this certificate from the Apple Developer Portal.

There's a repository that does this functionality in Node.js: https://github.com/tinovyatkin/pass-js/tree/master. There's another repository with an example structure: https://github.com/phatblat/phatblat.pass/tree/main. There's another useful tutorial that phatblat linked here: https://www.walletthat.com/help/creating-a-pass-type-id-pass-signing-certificate/

To run Apple Wallet for this repository, we'll need the Apple Developer Account certificate files. Please generate `signerCert.pem`, `signerKey.pem`, and `wwdr.pem` as specficied in [Generating Certificates](https://github.com/alexandercerutti/passkit-generator/wiki/Generating-Certificates) and place them in the `certs/` folder.

## Google Wallet

The main tutorial we are following to create a pass in Google Wallet is included here: https://codelabs.developers.google.com/add-to-wallet-web#0. The correspoding repository is kept at: https://github.com/google-pay/wallet-web-codelab/blob/main/web_complete/app.js. There is another example repository here: https://github.com/google-pay/wallet-samples/tree/main

There is also a notion of a "private pass" with additional security guarentees that we should visit if we deploy this at a larger scale: https://developers.google.com/wallet/generic-private-pass
