# Mobile Release Guide (Android + iOS)

## 1) Build web bundle for mobile

```powershell
npm run build:mobile
```

This creates static app files in `out/`.

## 2) Sync latest web code to native projects

```powershell
npx cap sync
```

## 3) Android release (Play Store)

```powershell
npx cap open android
```

In Android Studio:

1. `Build` -> `Generate Signed Bundle / APK`
2. Select `Android App Bundle (AAB)`
3. Use or create keystore
4. Build release `.aab`
5. Upload `.aab` in Google Play Console

## 4) iOS release (App Store)

```powershell
npx cap open ios
```

Then on a Mac (Xcode required):

1. Open `ios/App/App.xcworkspace`
2. Set Team + Bundle Identifier + Signing
3. `Product` -> `Archive`
4. Upload archive via Organizer to App Store Connect

## 5) Every new update

```powershell
npm run build:mobile
npx cap sync
```

Then rebuild Android/iOS release binaries from Android Studio / Xcode.
