import type { Locale } from "./i18n";

export type ToolId =
  | "pdf-to-word"
  | "word-to-pdf"
  | "image-to-pdf"
  | "png-to-jpg"
  | "jpg-to-png"
  | "compress-pdf";

/** Where the conversion runs: in the visitor's browser (free) or on our server. */
export type ToolMode = "browser" | "server";

type ToolText = {
  slug: string;
  name: string;
  title: string;
  description: string;
  intro: string;
};

export type Tool = {
  id: ToolId;
  mode: ToolMode;
  /** File extensions accepted, lowercase, without the dot. */
  accept: string[];
  multiple: boolean;
  outputExt: string;
  icon: string;
  text: Record<Locale, ToolText>;
};

export const tools: Tool[] = [
  {
    id: "pdf-to-word",
    mode: "server",
    accept: ["pdf"],
    multiple: false,
    outputExt: "docx",
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
    mode: "server",
    accept: ["doc", "docx", "odt", "rtf"],
    multiple: false,
    outputExt: "pdf",
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
    mode: "browser",
    accept: ["jpg", "jpeg", "png", "webp"],
    multiple: true,
    outputExt: "pdf",
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
    mode: "browser",
    accept: ["png", "webp"],
    multiple: false,
    outputExt: "jpg",
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
    mode: "browser",
    accept: ["jpg", "jpeg", "webp"],
    multiple: false,
    outputExt: "png",
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
    mode: "server",
    accept: ["pdf"],
    multiple: false,
    outputExt: "pdf",
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
];

export const findTool = (locale: Locale, slug: string) =>
  tools.find((t) => t.text[locale].slug === slug);

export const getTool = (id: string) => tools.find((t) => t.id === id);

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
