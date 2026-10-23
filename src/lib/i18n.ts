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
  download: string;
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
  heroTitle: string;
  heroSubtitle: string;
  chooseFiles: string;
  dropAnywhere: string;
  to: string;
  chooseFormat: string;
  searchFormat: string;
  addMore: string;
  convertAll: string;
  remove: string;
  statusReady: string;
  statusWaiting: string;
  statusConverting: string;
  statusDone: string;
  noTargets: string;
  categoryNames: Record<"image" | "document" | "spreadsheet" | "presentation", string>;
  compressLabel: string;
  popular: string;
  features: { icon: string; title: string; text: string }[];
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    siteName: "Convert",
    tagline: "Free online file converter",
    homeTitle: "Free online file converter: PDF, Word, Excel, images",
    homeDescription:
      "Convert PDF, Word, Excel, PowerPoint and image files to any format. Free, fast, no sign-up.",
    allTools: "All tools",
    download: "Download",
    errorGeneric: "Something went wrong. Please try again.",
    errorTooBig: "This file is too big (max 25 MB).",
    errorType: "This file type is not supported for this tool.",
    errorRateLimit: "Too many conversions. Please wait a few minutes.",
    howItWorks: "How it works",
    steps: [
      "Choose or drop your files.",
      "Pick the format you want, then click Convert.",
      "Download your converted files.",
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
    heroTitle: "File converter",
    heroSubtitle: "Convert your files to any format: PDF, Word, Excel, PowerPoint, images. Free, no sign-up.",
    chooseFiles: "Choose files",
    dropAnywhere: "or drop files here · 25 MB max per file",
    to: "to",
    chooseFormat: "Choose…",
    searchFormat: "Search a format",
    addMore: "Add more files",
    convertAll: "Convert",
    remove: "Remove",
    statusReady: "Ready",
    statusWaiting: "Waiting…",
    statusConverting: "Converting…",
    statusDone: "Done",
    noTargets: "This format is not supported yet",
    categoryNames: { document: "Document", image: "Image", spreadsheet: "Spreadsheet", presentation: "Presentation" },
    compressLabel: "PDF (smaller)",
    popular: "Popular conversions",
    features: [
      { icon: "🗂", title: "20+ formats", text: "Documents, spreadsheets, presentations and images, in one place." },
      { icon: "⚡", title: "Fast and simple", text: "Drop your files, pick a format, click Convert. That's it." },
      { icon: "🔒", title: "Private", text: "Image conversions stay in your browser. Other files are deleted right after conversion." },
      { icon: "📱", title: "Works everywhere", text: "Phone, tablet or computer: nothing to install." },
    ],
  },
  fr: {
    siteName: "Convert",
    tagline: "Convertisseur de fichiers gratuit en ligne",
    homeTitle: "Convertisseur de fichiers gratuit : PDF, Word, Excel, images",
    homeDescription:
      "Convertissez vos fichiers PDF, Word, Excel, PowerPoint et images dans n'importe quel format. Gratuit, rapide, sans inscription.",
    allTools: "Tous les outils",
    download: "Télécharger",
    errorGeneric: "Une erreur est survenue. Veuillez réessayer.",
    errorTooBig: "Ce fichier est trop lourd (25 Mo maximum).",
    errorType: "Ce type de fichier n'est pas pris en charge par cet outil.",
    errorRateLimit: "Trop de conversions. Patientez quelques minutes.",
    howItWorks: "Comment ça marche",
    steps: [
      "Choisissez ou déposez vos fichiers.",
      "Choisissez le format voulu, puis cliquez sur Convertir.",
      "Téléchargez vos fichiers convertis.",
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
    heroTitle: "Convertisseur de fichiers",
    heroSubtitle: "Convertissez vos fichiers dans n'importe quel format : PDF, Word, Excel, PowerPoint, images. Gratuit, sans inscription.",
    chooseFiles: "Choisir les fichiers",
    dropAnywhere: "ou déposez vos fichiers ici · 25 Mo max par fichier",
    to: "en",
    chooseFormat: "Choisir…",
    searchFormat: "Rechercher un format",
    addMore: "Ajouter des fichiers",
    convertAll: "Convertir",
    remove: "Retirer",
    statusReady: "Prêt",
    statusWaiting: "En attente…",
    statusConverting: "Conversion…",
    statusDone: "Terminé",
    noTargets: "Ce format n'est pas encore pris en charge",
    categoryNames: { document: "Document", image: "Image", spreadsheet: "Tableur", presentation: "Présentation" },
    compressLabel: "PDF (plus léger)",
    popular: "Conversions populaires",
    features: [
      { icon: "🗂", title: "Plus de 20 formats", text: "Documents, tableurs, présentations et images, au même endroit." },
      { icon: "⚡", title: "Rapide et simple", text: "Déposez vos fichiers, choisissez un format, cliquez sur Convertir. C'est tout." },
      { icon: "🔒", title: "Confidentiel", text: "Les images sont converties dans votre navigateur. Les autres fichiers sont supprimés juste après." },
      { icon: "📱", title: "Partout", text: "Téléphone, tablette ou ordinateur : rien à installer." },
    ],
  },
  ar: {
    siteName: "Convert",
    tagline: "محوّل ملفات مجاني على الإنترنت",
    homeTitle: "محوّل ملفات مجاني: PDF و Word و Excel والصور",
    homeDescription:
      "حوّل ملفات PDF و Word و Excel و PowerPoint والصور إلى أي صيغة. مجاني وسريع وبدون تسجيل.",
    allTools: "كل الأدوات",
    download: "تنزيل",
    errorGeneric: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    errorTooBig: "هذا الملف كبير جدًا (الحد الأقصى 25 ميغابايت).",
    errorType: "نوع الملف هذا غير مدعوم في هذه الأداة.",
    errorRateLimit: "عدد كبير من التحويلات. يرجى الانتظار بضع دقائق.",
    howItWorks: "كيف يعمل",
    steps: [
      "اختر ملفاتك أو اسحبها وأفلتها.",
      "اختر الصيغة المطلوبة، ثم انقر على تحويل.",
      "نزّل ملفاتك المحوَّلة.",
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
    heroTitle: "محوّل الملفات",
    heroSubtitle: "حوّل ملفاتك إلى أي صيغة: PDF و Word و Excel و PowerPoint والصور. مجاني وبدون تسجيل.",
    chooseFiles: "اختر الملفات",
    dropAnywhere: "أو أفلت الملفات هنا · 25 ميغابايت كحد أقصى لكل ملف",
    to: "إلى",
    chooseFormat: "اختر…",
    searchFormat: "ابحث عن صيغة",
    addMore: "أضف ملفات أخرى",
    convertAll: "تحويل",
    remove: "إزالة",
    statusReady: "جاهز",
    statusWaiting: "في الانتظار…",
    statusConverting: "جارٍ التحويل…",
    statusDone: "تم",
    noTargets: "هذه الصيغة غير مدعومة بعد",
    categoryNames: { document: "مستند", image: "صورة", spreadsheet: "جدول بيانات", presentation: "عرض تقديمي" },
    compressLabel: "PDF (أخف)",
    popular: "تحويلات شائعة",
    features: [
      { icon: "🗂", title: "أكثر من 20 صيغة", text: "مستندات وجداول بيانات وعروض تقديمية وصور في مكان واحد." },
      { icon: "⚡", title: "سريع وبسيط", text: "أفلت ملفاتك، اختر الصيغة، ثم انقر على تحويل. هذا كل شيء." },
      { icon: "🔒", title: "خصوصية", text: "تُحوَّل الصور داخل متصفحك. وتُحذف الملفات الأخرى فور انتهاء التحويل." },
      { icon: "📱", title: "يعمل في كل مكان", text: "على الهاتف أو اللوحي أو الحاسوب: لا شيء لتثبيته." },
    ],
  },
};
