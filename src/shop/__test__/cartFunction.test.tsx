import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import App from '../../App';
import { cartMockData } from '../__mocks__/cartData';
import { productListMockData } from '../__mocks__/productListMockData';

let currentCart = [...cartMockData];

jest.mock('../../api/cart', () => ({
  getShoppingCartData: jest.fn(() => Promise.resolve(currentCart)),
  postCartItem: jest.fn((productId: string) => {
    const foundProduct = productListMockData.find((p) => p.id === productId);
    if (!foundProduct) {
      throw new Error(`${productId} id를 가진 Product가 존재하지 않습니다.`);
    }
    currentCart.push({
      id: String(currentCart.length + 1),
      quantity: 1,
      product: foundProduct,
    });
    return Promise.resolve();
  }),
  deleteCartItem: jest.fn((cartId: string) => {
    currentCart = currentCart.filter((item) => item.id.toString() !== cartId);
    return Promise.resolve();
  }),
}));

jest.mock('../../api/products', () => ({
  getProductsData: jest.fn(() => Promise.resolve(productListMockData)),
}));

jest.mock('../../api/baseAPI', () => ({
  baseAPI: jest.fn(() => Promise.resolve(productListMockData)),
}));

describe('SHOP 페이지에 접속 시', () => {
  afterEach(() => {
    currentCart = [...cartMockData];
    jest.clearAllMocks();
  });

  it('장바구니 아이콘에 현재 장바구니 아이템 수가 표시된다', async () => {
    render(<App />);

    const cartButton = await screen.findByTestId('cart-count');
    expect(cartButton.textContent).toBe('2');
  });

  it('담기 버튼 클릭 시 장바구니 아이콘 숫자가 +1 증가한다', async () => {
    render(<App />);

    const cartButton = await screen.findByTestId('cart-count');
    expect(cartButton.textContent).toBe('2');

    const firstProductCard = await screen.findByTestId('product-26');
    const addButton = within(firstProductCard).getByRole('button');
    fireEvent.click(addButton);
    console.log('addButton ->>>>', addButton);

    await waitFor(() => {
      expect(screen.getByTestId('cart-count').textContent).toBe('3');
    });
  });

  it('빼기 버튼 클릭 시 장바구니 아이콘 숫자가 -1 감소한다', async () => {
    render(<App />);

    const cartButton = await screen.findByTestId('cart-count');
    expect(cartButton.textContent).toBe('2');

    const secondProductCard = await screen.findByTestId('product-42');
    const deleteButton = within(secondProductCard).getByRole('button');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('cart-count').textContent).toBe('1');
    });
  });
});
