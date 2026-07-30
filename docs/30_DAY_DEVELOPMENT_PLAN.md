# 30 kunlik rivojlantirish rejasi

Boshlanish sanasi: 2026-07-31
Tugash sanasi: 2026-08-29

Maqsad: keyingi ishlarni har kuni kichik, tekshirilgan va alohida commit sifatida yuritish. Har bir kun yakunida faqat shu kunlik ishlar commit qilinadi va `main` yoki alohida feature branch orqali GitHubga yuboriladi.

## Kunlik ish tartibi

1. Kun boshida `git pull origin main`.
2. Kunlik vazifa bo'yicha kichik scoped branch ochish:
   `git checkout -b day-01-parent-portal-audit`
3. Faqat shu kunlik fayllarga tegish.
4. Tekshiruvlarni ishga tushirish:
   `frontend`: `pnpm run lint`, `pnpm run build`
   `backend`: `npm run build`
5. Commit qilish:
   `git commit -m "day-01: audit parent portal responsive shell"`
6. Push qilish:
   `git push origin day-01-parent-portal-audit`
7. Pull request yoki merge tugagach branchni yopish.

## Commit nomlash qoidasi

Format:

```text
day-XX: short action and area
```

Misollar:

```text
day-01: audit parent portal responsive shell
day-02: stabilize parent messages layout
day-03: improve parent payments mobile tables
```

## 30 kunlik roadmap

| Kun | Sana | Branch | Asosiy vazifa | Tekshiruv |
| --- | --- | --- | --- | --- |
| 01 | 2026-07-31 | day-01-parent-shell-audit | Parent portal shell, navbar, sidebar va route holatini audit qilish | frontend lint/build |
| 02 | 2026-08-01 | day-02-messages-layout | Xabarlar chat list, chat window, input va file controls layoutini mustahkamlash | frontend lint/build |
| 03 | 2026-08-02 | day-03-payments-responsive | To'lovlar jadval/card responsive holatini tekshirish | frontend lint/build |
| 04 | 2026-08-03 | day-04-tariffs-responsive | Tariflar modal, plan card va action tugmalarini tekshirish | frontend lint/build |
| 05 | 2026-08-04 | day-05-attendance-responsive | Davomat ro'yxati va mobile scroll holatini mustahkamlash | frontend lint/build |
| 06 | 2026-08-05 | day-06-achievements-responsive | Yutuqlar cards/grid va matn sig'ishini tekshirish | frontend lint/build |
| 07 | 2026-08-06 | day-07-menu-responsive | Menyu bo'limi kunlik ovqatlanish kartalarini moslash | frontend lint/build |
| 08 | 2026-08-07 | day-08-vaccine-responsive | Emlash jadvali va statuslarini mobile/tabletga moslash | frontend lint/build |
| 09 | 2026-08-08 | day-09-health-responsive | Salomatlik bo'limidagi kartalar va ro'yxatlarni tekshirish | frontend lint/build |
| 10 | 2026-08-09 | day-10-pickup-responsive | Vakillar bo'limi form/modal/list ergonomikasini tekshirish | frontend lint/build |
| 11 | 2026-08-10 | day-11-documents-responsive | Hujjatlar bo'limi upload/list/action holatini tekshirish | frontend lint/build |
| 12 | 2026-08-11 | day-12-security-responsive | Xavfsizlik bo'limi form va credential UI holatini tekshirish | frontend lint/build |
| 13 | 2026-08-12 | day-13-modal-audit | Parent portal modallari ochilish/yopilishida overflow va layout audit | frontend lint/build |
| 14 | 2026-08-13 | day-14-api-boundaries | Parent portal API base URL va microservice routingni tekshirish | frontend lint, backend build |
| 15 | 2026-08-14 | day-15-upload-service | Shared upload endpoint va asset URL ishlashini tekshirish | backend build |
| 16 | 2026-08-15 | day-16-parent-service-errors | Parent portal service error handling va status kodlarini tartiblash | backend build |
| 17 | 2026-08-16 | day-17-parent-repository-audit | Parent portal repository query va kindergarten scope audit | backend build |
| 18 | 2026-08-17 | day-18-docker-compose-check | Docker compose services, ports, env va dependency chain audit | docker compose config/build |
| 19 | 2026-08-18 | day-19-docs-update | Architecture va deployment docs yangilash | docs review |
| 20 | 2026-08-19 | day-20-accessibility-pass | Parent portal keyboard/focus/label accessibility tekshirish | frontend lint/build |
| 21 | 2026-08-20 | day-21-mobile-regression | 360/390/430px mobile regression audit | frontend build |
| 22 | 2026-08-21 | day-22-tablet-regression | 768/820/1024px tablet regression audit | frontend build |
| 23 | 2026-08-22 | day-23-desktop-regression | 1280/1440/1536px desktop regression audit | frontend build |
| 24 | 2026-08-23 | day-24-no-animation-audit | Parent portal animation va smooth scroll qaytmaganini tekshirish | frontend lint/build |
| 25 | 2026-08-24 | day-25-performance-pass | Parent portal render/scroll freeze va heavy state audit | frontend build |
| 26 | 2026-08-25 | day-26-error-state-ui | Loading, empty, error states ko'rinishini tartiblash | frontend lint/build |
| 27 | 2026-08-26 | day-27-data-contracts | Frontend-backend DTO/data contract audit | frontend lint, backend build |
| 28 | 2026-08-27 | day-28-release-candidate | Release candidate build va smoke test | frontend build, backend build |
| 29 | 2026-08-28 | day-29-final-polish | UI mayda overflow, spacing va matn sig'ishini yakuniy polish | frontend lint/build |
| 30 | 2026-08-29 | day-30-release-notes | Yakuniy release notes, changelog va deploy checklist | docs review, all builds |

## Daily log template

Har kuni quyidagi blok to'ldiriladi:

```text
Date:
Branch:
Scope:
Changed:
Verified:
Known risk:
Commit:
Push:
```

## Definition of done

Kunlik ish tugagan hisoblanadi, agar:

- scoped o'zgarishlar commit qilingan bo'lsa;
- `git status` toza bo'lsa;
- kerakli build/lint tekshiruvlari o'tgan bo'lsa;
- GitHubga push qilingan bo'lsa;
- foydalanuvchi ko'radigan o'zgarish qisqa yozib qo'yilgan bo'lsa.
