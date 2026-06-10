# Aqlvoy Oshpaz Doimiy Taomlar Bazasi

`dishes` jadvali Aqlvoy oshpaz taomnoma menusi uchun doimiy retseptlar bazasi hisoblanadi.
U admin paneldagi "Taomlar bazasi" va taomnoma kiritishda tanlanadigan "Aqlvoy oshpaz taomi"
ma'lumotlari orqali shakllanadi.

Qoidalar:

- `dishes` jadvalidagi yozuvlar hech qachon avtomatik tozalanmaydi.
- Taomlar app restart, frontend build, backend build yoki Docker restartdan keyin saqlanib qolishi shart.
- Bog'cha o'chirilganda `dishes` yozuvlari o'chirilmaydi; kerak bo'lsa `kindergarten_id` bo'shatiladi.
- Delete endpointlar taomni o'chirmaydi va `409` xatolik qaytaradi.
- PostgreSQL darajasida `protect_aqlvoy_dishes` triggeri bevosita `DELETE FROM dishes` urinishlarini bloklaydi.

Bu qoida biznes-talab: Aqlvoy oshpaz bazasi taomnoma uchun asosiy bilimlar bazasi bo'lib, undagi
ma'lumotlar saytda hech qachon yo'qolmasligi kerak.
