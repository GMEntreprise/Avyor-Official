#!/usr/bin/env node
/**
 * Phase 1 « Actualités » — clés i18n de la page article (11 langues) :
 *   blogPost.toc.title, blogPost.blocks.*, blogPost.reading.*
 * Additif : on n'écrase que ces sous-objets, le reste de blogPost est préservé.
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N = resolve(__dirname, "../src/i18n");

const D = {
  fr: {
    toc: "Sommaire",
    blocks: {
      aretenir: "À retenir",
      astuce: "Astuce",
      callout: "Bon à savoir",
      definition: "Définition",
      attention: "Attention",
    },
    reading: { min: "min", left: "restantes", keyPoints: "À retenir", sources: "Sources" },
  },
  en: {
    toc: "Contents",
    blocks: {
      aretenir: "Key takeaway",
      astuce: "Tip",
      callout: "Good to know",
      definition: "Definition",
      attention: "Caution",
    },
    reading: { min: "min", left: "left", keyPoints: "Key takeaways", sources: "Sources" },
  },
  es: {
    toc: "Índice",
    blocks: {
      aretenir: "Para recordar",
      astuce: "Consejo",
      callout: "Bueno saber",
      definition: "Definición",
      attention: "Atención",
    },
    reading: { min: "min", left: "restantes", keyPoints: "Para recordar", sources: "Fuentes" },
  },
  de: {
    toc: "Inhalt",
    blocks: {
      aretenir: "Zum Merken",
      astuce: "Tipp",
      callout: "Gut zu wissen",
      definition: "Definition",
      attention: "Achtung",
    },
    reading: { min: "Min.", left: "übrig", keyPoints: "Zum Merken", sources: "Quellen" },
  },
  it: {
    toc: "Sommario",
    blocks: {
      aretenir: "Da ricordare",
      astuce: "Consiglio",
      callout: "Buono a sapersi",
      definition: "Definizione",
      attention: "Attenzione",
    },
    reading: { min: "min", left: "rimanenti", keyPoints: "Da ricordare", sources: "Fonti" },
  },
  pt: {
    toc: "Índice",
    blocks: {
      aretenir: "A reter",
      astuce: "Dica",
      callout: "Bom saber",
      definition: "Definição",
      attention: "Atenção",
    },
    reading: { min: "min", left: "restantes", keyPoints: "A reter", sources: "Fontes" },
  },
  ar: {
    toc: "المحتويات",
    blocks: {
      aretenir: "نقطة أساسية",
      astuce: "نصيحة",
      callout: "معلومة مفيدة",
      definition: "تعريف",
      attention: "تنبيه",
    },
    reading: { min: "دقيقة", left: "متبقية", keyPoints: "نقاط أساسية", sources: "المصادر" },
  },
  hi: {
    toc: "विषय-सूची",
    blocks: {
      aretenir: "मुख्य बात",
      astuce: "सुझाव",
      callout: "जानने योग्य",
      definition: "परिभाषा",
      attention: "सावधान",
    },
    reading: { min: "मिनट", left: "शेष", keyPoints: "मुख्य बातें", sources: "स्रोत" },
  },
  id: {
    toc: "Daftar isi",
    blocks: {
      aretenir: "Poin penting",
      astuce: "Kiat",
      callout: "Baik diketahui",
      definition: "Definisi",
      attention: "Perhatian",
    },
    reading: { min: "mnt", left: "tersisa", keyPoints: "Poin penting", sources: "Sumber" },
  },
  ja: {
    toc: "目次",
    blocks: {
      aretenir: "ポイント",
      astuce: "ヒント",
      callout: "豆知識",
      definition: "定義",
      attention: "注意",
    },
    reading: { min: "分", left: "残り", keyPoints: "ポイント", sources: "出典" },
  },
  zh: {
    toc: "目录",
    blocks: {
      aretenir: "要点",
      astuce: "小贴士",
      callout: "小知识",
      definition: "定义",
      attention: "注意",
    },
    reading: { min: "分钟", left: "剩余", keyPoints: "要点", sources: "来源" },
  },
};

for (const [lang, d] of Object.entries(D)) {
  const path = resolve(I18N, lang, "common.json");
  const json = JSON.parse(await readFile(path, "utf8"));
  json.blogPost ??= {};
  json.blogPost.toc = { title: d.toc };
  json.blogPost.blocks = d.blocks;
  json.blogPost.reading = d.reading;
  await writeFile(path, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(`✓ ${lang} → blogPost.toc/blocks/reading`);
}
console.log("Terminé.");
