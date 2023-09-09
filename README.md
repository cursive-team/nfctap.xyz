# nfctap.xyz

This repository stores code for the SBC and FtC activations, which is being developed to learn from and iterate upon for a much larger Devconnect experience (200 cards, 5k attendees).

## Repo setup

This repo uses Next.js 13 with the `app` folder. For styling, there is a mix of TailwindCSS and styled-components. Here are the different routes and their purposes:

- `default`
  - Right now, this screen is where the "foreground tap" logic is stored. This is where the browser uses FIDO2/WebAuthn APIs to get data from the card, which is generally more performant/less finicky than "background taps", where the phone detects the card without being on `nfctap.xyz`. The reason this logic is stored at the default route is because the card itself has a QR code to `nfctap.xyz` that is supposed to let people foreground tap. In future iterations, the current `home` route would live at the default page, and the foreground tap logic would live at a different route.
- `tap`
  - This is the route users are taken to when they tap on the card. It parses the query strings to extract the signature and public key to display the right collected Sigmoji.
- `home`
  - This is where users can see their entire collection of Sigmojis. It also has a `COLLECT` button that goes to the `default` page to enter foreground tapping.
- `clear`
  - This route allows you to clear your collection in `localStorage`. This is primarily useful for testing purposes and is not accessible from the UI without going to the URL.
- `recover`
  - This route is where you can recover your collection from a Apple/Google wallet backup. The logic is not complete as of the writing of this README.
- `prove`
  - This route is where you will be able to post a score to the leaderboard. Right now it just tests the proving flow.

## Storage setup

The primary store of your Sigmojis is in the browser `localStorage`. This is necessary because the browser needs access to them to be able to generate the necessary ZK proofs. But as `localStorage` isn't a permanent store (it can be cleared if users clear their browser cache or if localStorage gets too full data gets removed in an LRU fashion), we also give users the option to make a more permanent backup to their Apple/Google Wallet. This is a uniquely good solution for our experience because everything is mobile-first and most people have either an iPhone or an Android!

## Wallet backup setup

This section details the necessary setups to get Apple and Google Wallets working. There is still work to be done to make the adding fully client-side for Apple Wallet, but Google Wallet is already finished.

### Apple Wallet

The main link that includes resources is: https://developer.apple.com/documentation/walletpasses. Roughly, the entire structure is defined in `pass.json`, and then we use a certificate to sign a `manifest.json` file that includes all the hashes of all the files in the pass. Then, we zip up the entire directory, and change the extension to `.pkpass`. We get this certificate from the Apple Developer Portal.

There's a repository that does this functionality in Node.js: https://github.com/tinovyatkin/pass-js/tree/master. There's another repository with an example structure: https://github.com/phatblat/phatblat.pass/tree/main. There's another useful tutorial that phatblat linked here: https://www.walletthat.com/help/creating-a-pass-type-id-pass-signing-certificate/

To run Apple Wallet for this repository, we'll need the Apple Developer Account certificate files. Please generate `signerCert.pem`, `signerKey.pem`, and `wwdr.pem` as specficied in [Generating Certificates](https://github.com/alexandercerutti/passkit-generator/wiki/Generating-Certificates) and place them in the `certs/` folder.

The API route is at `app/api/generateApplePass`, and the button code is at `components/wallet/AppleWalletButton.tsx`.

### Google Wallet

The main tutorial we are following to create a pass in Google Wallet is included here: https://codelabs.developers.google.com/add-to-wallet-web#0. The correspoding repository is kept at: https://github.com/google-pay/wallet-web-codelab/blob/main/web_complete/app.js. There is another example repository here: https://github.com/google-pay/wallet-samples/tree/main

There is also a notion of a "private pass" with additional security guarentees that we should visit if we deploy this at a larger scale: https://developers.google.com/wallet/generic-private-pass. I have applied for access to this and will keep this updated on our access policy.

We need to set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of the service account key file. This is the file that we download from the Google Cloud Console. Instructions are at https://cloud.google.com/docs/authentication/provide-credentials-adc#local-key

The API route to update the pass is at `app/api/updateGooglePass`, and the button code is at `components/wallet/GoogleWalletButton.tsx`.
