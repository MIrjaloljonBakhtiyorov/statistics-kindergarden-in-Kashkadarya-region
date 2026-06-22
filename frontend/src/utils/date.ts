export function getAge(birthDate: string) {
  if (!birthDate) {
    return "";
  }

  const today = new Date();
  const date = new Date(birthDate);
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }

  return Number.isFinite(age) && age >= 0 ? String(age) : "";
}
