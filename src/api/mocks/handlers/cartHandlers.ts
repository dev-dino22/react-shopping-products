import { http, HttpResponse } from 'msw';
import { cartMockDataMSW } from '../cartData';
import { allProductsMSW } from '../productListMockData';

const baseURL = import.meta.env.VITE_BASE_URL;

export const getCartHandler = http.get(
  `${baseURL}/cart-items`,
  ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page');
    const size = url.searchParams.get('size');

    return HttpResponse.json({
      content: cartMockDataMSW,
      pageable: {
        pageNumber: page,
        pageSize: size,
        sort: {
          empty: false,
          sorted: true,
          unsorted: false,
        },
        offset: 0,
        paged: true,
        unpaged: false,
      },
      last: true,
      totalElements: cartMockDataMSW.length,
      totalPages: 1,
      size: 50,
      number: 0,
      sort: {
        empty: false,
        sorted: true,
        unsorted: false,
      },
      first: true,
      numberOfElements: cartMockDataMSW.length,
      empty: cartMockDataMSW.length === 0,
    });
  }
);

export const postCartHandler = http.post(
  `${baseURL}/cart-items`,
  async ({ request }) => {
    const { productId, quantity } = (await request.json()) as {
      productId: number;
      quantity: number;
    };
    const product = allProductsMSW.find(
      (product) => product.id.toString() === productId.toString()
    );
    if (!product)
      throw new Error('handlers.ts 에서 Product를 찾을 수 없습니다');
    const newCartData = {
      id: Date.now(),
      quantity,
      product,
    };
    cartMockDataMSW.push(newCartData);
    return HttpResponse.json(null, { status: 201 });
  }
);

export const deleteCartHandler = http.delete(
  `${baseURL}/cart-items/:id`,
  ({ params }) => {
    const { id } = params;
    const targetIndex = cartMockDataMSW.findIndex(
      (item) => item.id.toString() === id.toString()
    );
    if (targetIndex !== -1) {
      cartMockDataMSW.splice(targetIndex, 1);
    }
    return new HttpResponse(null, { status: 204 });
  }
);

export const patchCartHandler = http.patch(
  `${baseURL}/cart-items/:id`,
  async ({ params, request }) => {
    const { id } = params;
    const { quantity } = (await request.json()) as { quantity: number };

    const targetIndex = cartMockDataMSW.findIndex(
      (cart) => cart.id.toString() === id.toString()
    );
    if (targetIndex !== -1) {
      cartMockDataMSW[targetIndex].quantity = quantity;
    }
    return new HttpResponse(null, { status: 204 });
  }
);
