/**
 * Classes de formulário do admin. Ficam num módulo normal (sem "use client") de propósito:
 * importadas de um ficheiro "use client" por um Server Component, chegam como referência de
 * cliente (uma função), e `${inputCls} …` vira "function () { throw … }" — o campo perde o estilo.
 */

/** Campo do design system (ver `.app .field` em globals.css). */
export const inputCls = "field h-11";

/** Área de texto: a altura vem das linhas (`.app textarea.field` em globals.css). */
export const textareaCls = "field";
