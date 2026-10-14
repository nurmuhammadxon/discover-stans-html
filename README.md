# DiscoverStans — HTML / CSS / JS versiyasi

Next.js loyihasining (`nurmuhammadxon/DiscoverStans`) framework'siz, oddiy HTML + CSS + JS ga ko'chirilgan nusxasi.
Build bosqichi yo'q — fayllarni to'g'ridan-to'g'ri hosting'ga yuklash mumkin.

## 1. Sozlash (majburiy)

`js/config.js` ni oching va `API_URL` ga backend manzilini yozing
(Next.js loyihadagi `.env.local` ichidagi `NEXT_PUBLIC_API_URL` bilan bir xil):

```js
API_URL: "https://sizning-backend.onrender.com",
```

Aloqa ma'lumotlari, ijtimoiy tarmoqlar va kompaniya nomi ham shu faylda (`site` bo'limi).

## 2. Ishga tushirish

Til fayllari `fetch` bilan yuklanadi, shuning uchun `file://` emas, server kerak:

```bash
npx serve .            # yoki
python3 -m http.server 3000
```

## 3. Fayllar tuzilmasi

```
index.html  tours.html  tour.html?slug=...  about.html  services.html
contact.html  login.html  profile.html  oferta.html  privacy.html  404.html
css/style.css          — barcha uslublar (Tailwind/shadcn dizaynining qo'lda yozilgan ko'rinishi)
js/config.js           — API manzili va sayt ma'lumotlari
js/core.js             — API, auth (cookie + refresh token), i18n, toast, yordamchi funksiyalar
js/layout.js           — header, footer, mobil menyu
js/icons.js            — lucide ikonkalari (avtomatik yaratilgan)
js/pages/*.js          — har bir sahifa logikasi
locales/{en,uz,ru}/    — tarjimalar (Next.js loyihadagi bilan bir xil)
legal/*.html           — oferta va maxfiylik siyosati (markdown'dan HTML'ga o'tkazilgan)
images/                — rasmlar
```

## 4. Next.js'dan farqlar

- **Til**: URL prefiksi (`/uz/tours`) o'rniga tanlangan til `localStorage`da saqlanadi.
  Header'dagi til tugmasi yoki `?lng=uz` bilan almashtiriladi.
- **Tur sahifasi**: `/tours/samarqand-tour` o'rniga `tour.html?slug=samarqand-tour`.
- **SEO**: sahifalar brauzerda render qilinadi (SSR yo'q), `<title>` va meta JS orqali yangilanadi.
  Qidiruv tizimlarida yaxshi ko'rinishi muhim bo'lsa, Next.js'ning SSR'i afzalroq.
- **CORS**: backend yangi sayt domenidan kelgan so'rovlarga ruxsat berishi kerak.
- **USD kursi**: `cbu.uz` dan brauzerda olinadi (1 soat keshlanadi); CORS bo'lmasa `FALLBACK_USD_RATE` ishlatiladi.
- **Admin panel** hali ko'chirilmagan (header'dagi "Admin panel" havolasi `admin.html` ga olib boradi).
- `404.html` ildiz yo'llarini (`/css/...`) ishlatadi — saytni domen ildizida joylashtiring.
