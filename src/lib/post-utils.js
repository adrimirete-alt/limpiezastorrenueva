// Utilidades para enriquecer posts del blog: TOC, FAQs, enlazado interno automático.

import { localidades } from '../data/localidades.js';
import { categoriasMaquinaria } from '../data/maquinaria.js';

/**
 * Añade id a cada H2/H3 del HTML del post y genera lista TOC.
 */
export function processContent(html) {
    if (!html) return { html: '', toc: [] };
    const toc = [];
    let processed = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/gi, (match, level, inner) => {
        const text = inner.replace(/<[^>]+>/g, '').trim();
        const id = slugify(text);
        toc.push({ level: parseInt(level), text, id });
        return `<h${level} id="${id}">${inner}</h${level}>`;
    });
    return { html: processed, toc };
}

/**
 * Extrae FAQs del contenido buscando un bloque "## Preguntas frecuentes" + H3 + párrafos siguientes.
 * Funciona también con la estructura natural (cualquier H3 cuyo texto contenga "?").
 */
export function extractFAQs(html) {
    if (!html) return [];
    const faqs = [];
    // Busca todos los H3 que empiecen por ¿ o que terminen con ?
    const re = /<h3[^>]*>(¿[^<]+\?|[^<]+\?)<\/h3>\s*<p>([\s\S]*?)<\/p>/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
        const q = m[1].replace(/<[^>]+>/g, '').trim();
        const a = m[2].replace(/<[^>]+>/g, '').trim();
        if (q.length > 5 && a.length > 20) {
            faqs.push({ question: q, answer: a });
        }
    }
    return faqs.slice(0, 8);
}

/**
 * Sugiere enlaces internos contextuales según el contenido y categoría.
 */
export function suggestInternalLinks(post) {
    const links = [];

    // Categoría → página de categoría
    if (post.category) {
        const catMap = {
            comunidades: { url: '/servicios', label: 'Servicio de limpieza de comunidades' },
            garajes: { url: '/servicios', label: 'Limpieza de garajes y parkings' },
            oficinas: { url: '/servicios', label: 'Limpieza de oficinas en Torrevieja' },
            industrial: { url: '/servicios', label: 'Limpieza industrial profesional' },
            maquinaria: { url: '/maquinaria', label: 'Catálogo de maquinaria profesional' },
            zonas: { url: '/zonas', label: 'Zonas de servicio' },
            consejos: { url: '/blog', label: 'Más consejos en el blog' },
        };
        if (catMap[post.category]) links.push(catMap[post.category]);
    }

    // Si el post menciona una localidad, enlazar
    const titleLower = (post.title + ' ' + (post.content || '')).toLowerCase().substring(0, 5000);
    for (const loc of localidades) {
        if (titleLower.includes(loc.nombre.toLowerCase())) {
            links.push({ url: `/zonas/${loc.slug}`, label: `Empresa de limpieza en ${loc.nombre}` });
        }
    }

    // Si menciona alguna categoría de maquinaria
    for (const cat of categoriasMaquinaria) {
        if (titleLower.includes(cat.slug) || titleLower.includes(cat.nombre.toLowerCase())) {
            links.push({ url: `/maquinaria/${cat.slug}`, label: cat.nombre });
        }
    }

    // Calculadora siempre
    links.push({ url: '/calculadora-presupuesto', label: 'Calcula tu presupuesto en 60 segundos' });

    // Deduplicar por URL
    const seen = new Set();
    return links.filter(l => {
        if (seen.has(l.url)) return false;
        seen.add(l.url);
        return true;
    }).slice(0, 6);
}

/**
 * Cuenta palabras del HTML para schema y reading time.
 */
export function countWords(html) {
    if (!html) return 0;
    return html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
}

function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 60);
}
