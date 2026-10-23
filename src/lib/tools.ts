import type { Locale } from "./i18n";

export type ToolId =
  | "pdf-to-word"
  | "word-to-pdf"
  | "image-to-pdf"
  | "png-to-jpg"
  | "jpg-to-png"
  | "compress-pdf"
  | "excel-to-pdf"
  | "pdf-to-jpg"
  | "powerpoint-to-pdf";

type ToolText = {
  slug: string;
  name: string;
  title: string;
  description: string;
  intro: string;
};

/**
 * A tool is a landing page for one popular conversion. It opens the same converter as the
 * home page, with the output format chosen in advance.
 */
export type Tool = {
  id: ToolId;
  /** Input formats this page is about (the converter still accepts any file). */
  from: string[];
  /** Output format picked for those inputs (see targetsFor in formats.ts). */
  to: string;
  icon: string;
  text: Record<Locale, ToolText>;
};

export const tools: Tool[] = [
  {
    id: "pdf-to-word",
    from: ["pdf"],
    to: "docx",
    icon: "📝",
    text: {
      en: {
        slug: "pdf-to-word",
        name: "PDF to Word",
        title: "PDF to Word converter, free online",
        description: "Convert PDF files to editable Word documents (DOCX) for free. No sign-up, files deleted after conversion.",
        intro: "Turn a PDF into an editable Word document (.docx) in a few seconds.",
      },
      fr: {
        slug: "pdf-en-word",
        name: "PDF en Word",
        title: "Convertir PDF en Word gratuitement",
        description: "Convertissez vos PDF en documents Word (DOCX) modifiables, gratuitement et sans inscription. Fichiers supprimés après conversion.",
        intro: "Transformez un PDF en document Word (.docx) modifiable en quelques secondes.",
      },
      ar: {
        slug: "pdf-to-word",
        name: "PDF إلى Word",
        title: "تحويل PDF إلى Word مجانًا",
        description: "حوّل ملفات PDF إلى مستندات Word (DOCX) قابلة للتعديل مجانًا وبدون تسجيل. تُحذف الملفات بعد التحويل.",
        intro: "حوّل ملف PDF إلى مستند Word (.docx) قابل للتعديل في ثوانٍ.",
      },
    },
  },
  {
    id: "word-to-pdf",
    from: ["doc", "docx", "odt", "rtf"],
    to: "pdf",
    icon: "📄",
    text: {
      en: {
        slug: "word-to-pdf",
        name: "Word to PDF",
        title: "Word to PDF converter, free online",
        description: "Convert Word documents (DOC, DOCX) to PDF for free. Keeps your layout. No sign-up.",
        intro: "Turn a Word document into a PDF that looks the same on every device.",
      },
      fr: {
        slug: "word-en-pdf",
        name: "Word en PDF",
        title: "Convertir Word en PDF gratuitement",
        description: "Convertissez vos documents Word (DOC, DOCX) en PDF gratuitement, en gardant la mise en page. Sans inscription.",
        intro: "Transformez un document Word en PDF identique sur tous les appareils.",
      },
      ar: {
        slug: "word-to-pdf",
        name: "Word إلى PDF",
        title: "تحويل Word إلى PDF مجانًا",
        description: "حوّل مستندات Word (DOC و DOCX) إلى PDF مجانًا مع الحفاظ على التنسيق. بدون تسجيل.",
        intro: "حوّل مستند Word إلى ملف PDF يظهر بالشكل نفسه على كل الأجهزة.",
      },
    },
  },
  {
    id: "image-to-pdf",
    from: ["jpg", "png", "webp"],
    to: "pdf",
    icon: "🖼️",
    text: {
      en: {
        slug: "image-to-pdf",
        name: "Image to PDF",
        title: "Image to PDF converter: JPG, PNG to PDF",
        description: "Combine JPG, PNG or WEBP images into one PDF, for free. Runs in your browser, nothing is uploaded.",
        intro: "Put one or more images into a single PDF, one image per page.",
      },
      fr: {
        slug: "image-en-pdf",
        name: "Image en PDF",
        title: "Convertir une image en PDF : JPG, PNG en PDF",
        description: "Rassemblez vos images JPG, PNG ou WEBP dans un seul PDF, gratuitement. Tout se passe dans votre navigateur.",
        intro: "Placez une ou plusieurs images dans un seul PDF, une image par page.",
      },
      ar: {
        slug: "image-to-pdf",
        name: "صورة إلى PDF",
        title: "تحويل الصور إلى PDF: JPG و PNG إلى PDF",
        description: "اجمع صور JPG أو PNG أو WEBP في ملف PDF واحد مجانًا. يعمل داخل متصفحك دون رفع أي ملف.",
        intro: "ضع صورة أو أكثر في ملف PDF واحد، صورة في كل صفحة.",
      },
    },
  },
  {
    id: "png-to-jpg",
    from: ["png", "webp"],
    to: "jpg",
    icon: "🎨",
    text: {
      en: {
        slug: "png-to-jpg",
        name: "PNG to JPG",
        title: "PNG to JPG converter, free online",
        description: "Convert PNG (or WEBP) images to JPG for free. Runs in your browser, nothing is uploaded.",
        intro: "Make a smaller JPG from a PNG image. Transparent areas become white.",
      },
      fr: {
        slug: "png-en-jpg",
        name: "PNG en JPG",
        title: "Convertir PNG en JPG gratuitement",
        description: "Convertissez vos images PNG (ou WEBP) en JPG gratuitement. Tout se passe dans votre navigateur.",
        intro: "Obtenez un JPG plus léger à partir d'une image PNG. Les zones transparentes deviennent blanches.",
      },
      ar: {
        slug: "png-to-jpg",
        name: "PNG إلى JPG",
        title: "تحويل PNG إلى JPG مجانًا",
        description: "حوّل صور PNG (أو WEBP) إلى JPG مجانًا. يعمل داخل متصفحك دون رفع أي ملف.",
        intro: "احصل على صورة JPG أخف من صورة PNG. تصبح المناطق الشفافة بيضاء.",
      },
    },
  },
  {
    id: "jpg-to-png",
    from: ["jpg", "webp"],
    to: "png",
    icon: "🖌️",
    text: {
      en: {
        slug: "jpg-to-png",
        name: "JPG to PNG",
        title: "JPG to PNG converter, free online",
        description: "Convert JPG (or WEBP) images to PNG for free. Runs in your browser, nothing is uploaded.",
        intro: "Turn a JPG photo into a lossless PNG image.",
      },
      fr: {
        slug: "jpg-en-png",
        name: "JPG en PNG",
        title: "Convertir JPG en PNG gratuitement",
        description: "Convertissez vos images JPG (ou WEBP) en PNG gratuitement. Tout se passe dans votre navigateur.",
        intro: "Transformez une photo JPG en image PNG sans perte.",
      },
      ar: {
        slug: "jpg-to-png",
        name: "JPG إلى PNG",
        title: "تحويل JPG إلى PNG مجانًا",
        description: "حوّل صور JPG (أو WEBP) إلى PNG مجانًا. يعمل داخل متصفحك دون رفع أي ملف.",
        intro: "حوّل صورة JPG إلى صورة PNG بدون فقدان للجودة.",
      },
    },
  },
  {
    id: "compress-pdf",
    from: ["pdf"],
    to: "compress",
    icon: "🗜️",
    text: {
      en: {
        slug: "compress-pdf",
        name: "Compress PDF",
        title: "Compress PDF: reduce PDF file size for free",
        description: "Make your PDF smaller for email and upload, for free. Good quality, no sign-up.",
        intro: "Reduce the size of a PDF while keeping it readable.",
      },
      fr: {
        slug: "compresser-pdf",
        name: "Compresser PDF",
        title: "Compresser un PDF : réduire la taille gratuitement",
        description: "Réduisez la taille de vos PDF pour l'e-mail ou l'envoi en ligne, gratuitement et sans inscription.",
        intro: "Réduisez le poids d'un PDF tout en le gardant lisible.",
      },
      ar: {
        slug: "compress-pdf",
        name: "ضغط PDF",
        title: "ضغط PDF: تقليل حجم ملف PDF مجانًا",
        description: "صغّر حجم ملف PDF لإرساله بالبريد أو رفعه، مجانًا وبدون تسجيل.",
        intro: "قلّل حجم ملف PDF مع الحفاظ على وضوحه.",
      },
    },
  },
  {
    id: "excel-to-pdf",
    from: ["xlsx", "xls", "ods", "csv"],
    to: "pdf",
    icon: "📊",
    text: {
      en: {
        slug: "excel-to-pdf",
        name: "Excel to PDF",
        title: "Excel to PDF converter, free online",
        description: "Convert Excel spreadsheets (XLSX, XLS, CSV) to PDF for free. No sign-up, files deleted after conversion.",
        intro: "Turn a spreadsheet into a PDF that is easy to print and share.",
      },
      fr: {
        slug: "excel-en-pdf",
        name: "Excel en PDF",
        title: "Convertir Excel en PDF gratuitement",
        description: "Convertissez vos tableaux Excel (XLSX, XLS, CSV) en PDF gratuitement et sans inscription.",
        intro: "Transformez un tableur en PDF facile à imprimer et à partager.",
      },
      ar: {
        slug: "excel-to-pdf",
        name: "Excel إلى PDF",
        title: "تحويل Excel إلى PDF مجانًا",
        description: "حوّل جداول Excel (XLSX و XLS و CSV) إلى PDF مجانًا وبدون تسجيل.",
        intro: "حوّل جدول البيانات إلى ملف PDF سهل الطباعة والمشاركة.",
      },
    },
  },
  {
    id: "pdf-to-jpg",
    from: ["pdf"],
    to: "jpg",
    icon: "🖼",
    text: {
      en: {
        slug: "pdf-to-jpg",
        name: "PDF to JPG",
        title: "PDF to JPG converter, free online",
        description: "Turn every page of a PDF into a JPG image, for free. Several pages come in one ZIP file.",
        intro: "Get each page of your PDF as a high-quality JPG image.",
      },
      fr: {
        slug: "pdf-en-jpg",
        name: "PDF en JPG",
        title: "Convertir PDF en JPG gratuitement",
        description: "Transformez chaque page d'un PDF en image JPG, gratuitement. Plusieurs pages arrivent dans un fichier ZIP.",
        intro: "Obtenez chaque page de votre PDF en image JPG de bonne qualité.",
      },
      ar: {
        slug: "pdf-to-jpg",
        name: "PDF إلى JPG",
        title: "تحويل PDF إلى JPG مجانًا",
        description: "حوّل كل صفحة من ملف PDF إلى صورة JPG مجانًا. تصل الصفحات المتعددة في ملف ZIP واحد.",
        intro: "احصل على كل صفحة من ملف PDF كصورة JPG عالية الجودة.",
      },
    },
  },
  {
    id: "powerpoint-to-pdf",
    from: ["pptx", "ppt", "odp"],
    to: "pdf",
    icon: "📽",
    text: {
      en: {
        slug: "powerpoint-to-pdf",
        name: "PowerPoint to PDF",
        title: "PowerPoint to PDF converter, free online",
        description: "Convert PowerPoint presentations (PPTX, PPT) to PDF for free. No sign-up.",
        intro: "Turn your slides into a PDF anyone can open.",
      },
      fr: {
        slug: "powerpoint-en-pdf",
        name: "PowerPoint en PDF",
        title: "Convertir PowerPoint en PDF gratuitement",
        description: "Convertissez vos présentations PowerPoint (PPTX, PPT) en PDF gratuitement et sans inscription.",
        intro: "Transformez vos diapositives en PDF lisible par tous.",
      },
      ar: {
        slug: "powerpoint-to-pdf",
        name: "PowerPoint إلى PDF",
        title: "تحويل PowerPoint إلى PDF مجانًا",
        description: "حوّل عروض PowerPoint (PPTX و PPT) إلى PDF مجانًا وبدون تسجيل.",
        intro: "حوّل شرائح العرض إلى ملف PDF يفتحه الجميع.",
      },
    },
  },
];

export const findTool = (locale: Locale, slug: string) =>
  tools.find((t) => t.text[locale].slug === slug);

export const getTool = (id: string) => tools.find((t) => t.id === id);

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
