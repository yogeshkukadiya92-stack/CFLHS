## GitHub Actions iOS TestFlight

This repo now includes a workflow at `.github/workflows/ios-testflight.yml`.

It does two things on a macOS GitHub runner:

1. Builds an iOS `.ipa` from the Capacitor project
2. Optionally uploads that build to TestFlight

### Required GitHub repository secrets

Add these in GitHub:

- `APPLE_BUNDLE_ID`
- `APPLE_TEAM_ID`
- `IOS_CERTIFICATE_P12_BASE64`
- `IOS_CERTIFICATE_PASSWORD`
- `IOS_PROVISION_PROFILE_BASE64`
- `IOS_PROVISION_PROFILE_SPECIFIER`
- `IOS_KEYCHAIN_PASSWORD`
- `APP_STORE_CONNECT_KEY_ID`
- `APP_STORE_CONNECT_ISSUER_ID`
- `APP_STORE_CONNECT_PRIVATE_KEY`

### What each secret is

- `APPLE_BUNDLE_ID`: example `com.habitshare.app`
- `APPLE_TEAM_ID`: your Apple Developer team ID
- `IOS_CERTIFICATE_P12_BASE64`: base64 of the distribution certificate `.p12`
- `IOS_CERTIFICATE_PASSWORD`: password used while exporting the `.p12`
- `IOS_PROVISION_PROFILE_BASE64`: base64 of the App Store provisioning profile `.mobileprovision`
- `IOS_PROVISION_PROFILE_SPECIFIER`: profile name shown in Apple Developer / Xcode
- `IOS_KEYCHAIN_PASSWORD`: any strong random password for the temporary CI keychain
- `APP_STORE_CONNECT_KEY_ID`: App Store Connect API key ID
- `APP_STORE_CONNECT_ISSUER_ID`: App Store Connect issuer ID
- `APP_STORE_CONNECT_PRIVATE_KEY`: contents of the `AuthKey_XXXXXX.p8` file

### Windows PowerShell: convert files to Base64

Certificate:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\dist-cert.p12")) | Set-Clipboard
```

Provisioning profile:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\AppStore.mobileprovision")) | Set-Clipboard
```

### App Store Connect API key

For `APP_STORE_CONNECT_PRIVATE_KEY`, open the `.p8` file and paste the full contents exactly as-is into the GitHub secret.

### How to run

1. Open the GitHub repo
2. Go to `Actions`
3. Open `iOS TestFlight`
4. Click `Run workflow`
5. Leave `upload_to_testflight` enabled if you want direct TestFlight upload

### Result

- The workflow always uploads the `.ipa` as a GitHub Actions artifact
- If upload is enabled and signing is correct, the same build is uploaded to TestFlight

### Important note

You still need an active Apple Developer account, valid signing certificate, App Store provisioning profile, and an App Store Connect API key. Without those secrets, GitHub Actions cannot produce an installable iPhone build.
