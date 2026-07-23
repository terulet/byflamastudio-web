# FLAMA Studio — web

Sitio web estático de **FLAMA Studio**, publicado en `byflamastudio.com` mediante GitHub Pages.

Este repositorio contiene **únicamente la web pública**. El monorepo privado
[`terulet/byflamastudio`](https://github.com/terulet/byflamastudio) (Atlas, wallet, comandas)
sigue siendo privado y no forma parte de esta publicación.

## Publicar

1. El contenido de la raíz se sirve desde la rama `main`.
2. GitHub → Settings → Pages → Source: `main` / `root`.
3. El archivo `CNAME` deja configurado el dominio `byflamastudio.com`.

> El dominio debe estar **verificado** en Settings → Pages de la cuenta
> (registro TXT `_github-pages-challenge-terulet`). Sin esa verificación el
> dominio queda reclamable por terceros si Pages se desactiva.

## Archivos

```
index.html   ← La web (una sola página)      favicon.svg  ← Icono
ca.html      ← Versión en catalán            assets/      ← Imágenes (OG)
style.css    ← Estilos                       CNAME / robots.txt / sitemap.xml
script.js    ← Calculadora, menú, animaciones
```
