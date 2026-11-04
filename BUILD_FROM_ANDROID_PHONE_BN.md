# Android ফোন দিয়ে APK build (GitHub Actions)

1. ZIP extract করুন এবং GitHub-এ sign in করুন।
2. GitHub-এ New repository তৈরি করুন (Private রাখুন), যেমন `tanvir-pharma-android`।
3. এই project-এর ভেতরের সব ফাইল ও `.github` folder repository-র root-এ upload করুন। `.github/workflows/android-apk.yml`-টি অবশ্যই থাকতে হবে।
4. Repository-র Actions tab খুলুন। প্রথমবার workflow চালানোর অনুমতি চাইলে I understand / Enable actions দিন।
5. বাম পাশে **Build Tanvir Pharma APK** workflow নির্বাচন করে **Run workflow** চাপুন।
6. Build সফল হলে run-এর নিচে **Artifacts** থেকে `TanvirPharma-debug-apk` download করুন। ZIP extract করে `app-debug.apk` ফোনে install করুন। Android যদি অনুমতি চায়, শুধু আপনার ডাউনলোড করা APK-এর জন্য browser/files app-কে “Install unknown apps” অনুমতি দিন।

গুরুত্বপূর্ণ:
- এটি debug APK; Play Store release/signed production APK নয়।
- GitHub Actions-এ build সফল হবে—এ নিশ্চয়তা নেই; error হলে Actions log-এর শেষ অংশ পাঠান।
- Firebase config ফাইলে project identifier থাকে; repository Private রাখুন। কখনো service-account private key বা Admin SDK credential upload করবেন না।
- এই source এখন starter/demo; README-তে উল্লেখিত cloud screen integration, security testing, backups, barcode, expiry alerts, invoice/report ও server-side transaction কাজ সম্পূর্ণ না হওয়া পর্যন্ত বাস্তব ব্যবসার live data ব্যবহার করবেন না।
