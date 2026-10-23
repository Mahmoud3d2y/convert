export const locales = ["en", "fr", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const dir = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};

export type Dictionary = {
  siteName: string;
  tagline: string;
  homeTitle: string;
  homeDescription: string;
  allTools: string;
  dropHere: string;
  orClick: string;
  maxSize: string;
  convert: string;
  converting: string;
  download: string;
  again: string;
  errorGeneric: string;
  errorTooBig: string;
  errorType: string;
  errorRateLimit: string;
  howItWorks: string;
  steps: [string, string, string];
  faq: string;
  faqs: { q: string; a: string }[];
  privacy: string;
  privacyTitle: string;
  privacyBody: string[];
  footer: string;
  advertisement: string;
  filesSelected: string;
  inBrowser: string;
  onServer: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    siteName: "Convert",
    tagline: "Free online file converter",
    homeTitle: "Free online file converter: PDF, Word, images",
    homeDescription:
      "Convert PDF to Word, Word to PDF, images to PDF, PNG to JPG and compress PDF files. Free, fast, no sign-up.",
    allTools: "All tools",
    dropHere: "Drop your file here",
    orClick: "or click to choose",
    maxSize: "Max 25 MB",
    convert: "Convert",
    converting: "Converting…",
    download: "Download",
    again: "Convert another file",
    errorGeneric: "Something went wrong. Please try again.",
    errorTooBig: "This file is too big (max 25 MB).",
    errorType: "This file type is not supported for this tool.",
    errorRateLimit: "Too many conversions. Please wait a few minutes.",
    howItWorks: "How it works",
    steps: [
      "Choose or drop your file.",
      "Click Convert and wait a few seconds.",
      "Download your converted file.",
    ],
    faq: "Questions",
    faqs: [
      { q: "Is it free?", a: "Yes, every tool is 100% free with no sign-up." },
      {
        q: "Are my files safe?",
        a: "Image tools run in your browser, so your files never leave your device. Office and PDF tools upload the file to our server and delete it right after conversion.",
      },
      { q: "Is there a size limit?", a: "Files can be up to 25 MB." },
    ],
    privacy: "Privacy",
    privacyTitle: "Privacy policy",
    privacyBody: [
      "We do not keep your files. Files sent to our server are deleted as soon as the conversion is done. Image tools run entirely in your browser.",
      "We do not ask for an account, name or email.",
      "This site shows ads from Google AdSense. Google and its partners may use cookies to show ads based on your visits to this and other sites. You can turn off personalised ads at https://adssettings.google.com.",
      "For visitors in the EU/UK, a consent message lets you accept or refuse advertising cookies.",
    ],
    footer: "Free file converter. Files are deleted after conversion.",
    advertisement: "Advertisement",
    filesSelected: "files selected",
    inBrowser: "Runs in your browser, your file stays on your device",
    onServer: "Your file is deleted right after conversion",
  },
  fr: {
    siteName: "Convert",
    tagline: "Convertisseur de fichiers gratuit en ligne",
    homeTitle: "Convertisseur de fichiers gratuit : PDF, Word, images",
    homeDescription:
      "Convertissez PDF en Word, Word en PDF, images en PDF, PNG en JPG et compressez vos PDF. Gratuit, rapide, sans inscription.",
    allTools: "Tous les outils",
    dropHere: "Déposez votre fichier ici",
    orClick: "ou cliquez pour choisir",
    maxSize: "25 Mo maximum",
    convert: "Convertir",
    converting: "Conversion…",
    download: "Télécharger",
    again: "Convertir un autre fichier",
    errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
    errorTooBig: "Ce fichier est trop lourd (25 Mo maximum).",
    errorType: "Ce type de fichier n'est pas pris en charge par cet outil.",
    errorRateLimit: "Trop de conversions. Patientez quelques minutes.",
    howItWorks: "Comment ça marche",
    steps: [
      "Choisissez ou déposez votre fichier.",
      "Cliquez sur Convertir et patientez quelques secondes.",
      "Téléchargez votre fichier converti.",
    ],
    faq: "Questions",
    faqs: [
      { q: "C'est gratuit ?", a: "Oui, tous les outils sont 100 % gratuits, sans inscription." },
      {
        q: "Mes fichiers sont-ils en sécurité ?",
        a: "Les outils image fonctionnent dans votre navigateur : vos fichiers ne quittent pas votre appareil. Les outils PDF et Word envoient le fichier à notre serveur, qui le supprime dès la fin de la conversion.",
      },
      { q: "Y a-t-il une limite de taille ?", a: "Les fichiers peuvent faire jusqu'à 25 Mo." },
    ],
    privacy: "Confidentialité",
    privacyTitle: "Politique de confidentialité",
    privacyBody: [
      "Nous ne conservons pas vos fichiers. Les fichiers envoyés à notre serveur sont supprimés dès la fin de la conversion. Les outils image fonctionnent entièrement dans votre navigateur.",
      "Nous ne demandons ni compte, ni nom, ni e-mail.",
      "Ce site affiche des publicités Google AdSense. Google et ses partenaires peuvent utiliser des cookies pour afficher des annonces selon vos visites sur ce site et d'autres. Vous pouvez désactiver les annonces personnalisées sur https://adssettings.google.com.",
      "Pour les visiteurs de l'UE et du Royaume-Uni, un message de consentement permet d'accepter ou de refuser les cookies publicitaires.",
    ],
    footer: "Convertisseur de fichiers gratuit. Les fichiers sont supprimés après conversion.",
    advertisement: "Publicité",
    filesSelected: "fichiers sélectionnés",
    inBrowser: "Fonctionne dans votre navigateur, votre fichier reste sur votre appareil",
    onServer: "Votre fichier est supprimé juste après la conversion",
  },
  ar: {
    siteName: "Convert",
    tagline: "محوّل ملفات مجاني على الإنترنت",
    homeTitle: "محوّل ملفات مجاني: PDF و Word والصور",
    homeDescription:
      "حوّل PDF إلى Word و Word إلى PDF والصور إلى PDF و PNG إلى JPG واضغط ملفات PDF. مجاني وسريع وبدون تسجيل.",
    allTools: "كل الأدوات",
    dropHere: "اسحب ملفك وأفلته هنا",
    orClick: "أو انقر للاختيار",
    maxSize: "الحد الأقصى 25 ميغابايت",
    convert: "تحويل",
    converting: "جارٍ التحويل…",
    download: "تنزيل",
    again: "تحويل ملف آخر",
    errorGeneric: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    errorTooBig: "هذا الملف كبير جدًا (الحد الأقصى 25 ميغابايت).",
    errorType: "نوع الملف هذا غير مدعوم في هذه الأداة.",
    errorRateLimit: "عدد كبير من التحويلات. يرجى الانتظار بضع دقائق.",
    howItWorks: "كيف يعمل",
    steps: [
      "اختر ملفك أو اسحبه وأفلته.",
      "انقر على تحويل وانتظر بضع ثوانٍ.",
      "نزّل الملف المحوَّل.",
    ],
    faq: "أسئلة",
    faqs: [
      { q: "هل الخدمة مجانية؟", a: "نعم، كل الأدوات مجانية 100٪ وبدون تسجيل." },
      {
        q: "هل ملفاتي آمنة؟",
        a: "أدوات الصور تعمل داخل متصفحك، فلا تغادر ملفاتك جهازك. أدوات PDF و Word ترسل الملف إلى خادمنا الذي يحذفه فور انتهاء التحويل.",
      },
      { q: "هل هناك حد لحجم الملف؟", a: "يمكن أن يصل حجم الملف إلى 25 ميغابايت." },
    ],
    privacy: "الخصوصية",
    privacyTitle: "سياسة الخصوصية",
    privacyBody: [
      "لا نحتفظ بملفاتك. تُحذف الملفات المرسلة إلى خادمنا فور انتهاء التحويل. أدوات الصور تعمل بالكامل داخل متصفحك.",
      "لا نطلب حسابًا ولا اسمًا ولا بريدًا إلكترونيًا.",
      "يعرض هذا الموقع إعلانات Google AdSense. قد تستخدم Google وشركاؤها ملفات تعريف الارتباط لعرض إعلانات بناءً على زياراتك لهذا الموقع ومواقع أخرى. يمكنك إيقاف الإعلانات المخصصة من https://adssettings.google.com.",
      "لزوار الاتحاد الأوروبي والمملكة المتحدة، تتيح لك رسالة موافقة قبول ملفات تعريف الارتباط الإعلانية أو رفضها.",
    ],
    footer: "محوّل ملفات مجاني. تُحذف الملفات بعد التحويل.",
    advertisement: "إعلان",
    filesSelected: "ملفات محددة",
    inBrowser: "يعمل داخل متصفحك، ويبقى ملفك على جهازك",
    onServer: "يُحذف ملفك فور انتهاء التحويل",
  },
};
