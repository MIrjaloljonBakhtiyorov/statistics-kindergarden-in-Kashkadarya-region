export const isAqlvoyDefaultDish = (dish: any) => Boolean(dish?.isAqlvoyDefault);

export const withAqlvoyDefaultDishes = (dishes: any[] = []) => {
  return Array.isArray(dishes) ? dishes : [];
};
