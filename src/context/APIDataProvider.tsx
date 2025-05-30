import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { showToast } from '../utils/toast/showToast';

type APIStateMap = Record<
  string,
  {
    data?: unknown;
    loading: boolean;
    error: unknown;
  }
>;

const APIContext = createContext<{
  state: APIStateMap;
  setState: React.Dispatch<React.SetStateAction<APIStateMap>>;
}>({
  state: {},
  setState: () => {},
});

export function APIDataProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<APIStateMap>({});

  return (
    <APIContext.Provider value={{ state, setState }}>
      {children}
    </APIContext.Provider>
  );
}
export function useAPIDataContext<T>({
  fetcher,
  name,
}: {
  fetcher: () => Promise<T>;
  name: string;
}) {
  const { state, setState } = useContext(APIContext);

  const request = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      [name]: { data: null, loading: true, error: null },
    }));

    try {
      const result = await fetcher();
      setState((prev) => ({
        ...prev,
        [name]: { data: result, loading: false, error: null },
      }));
    } catch (e) {
      setState((prev) => ({
        ...prev,
        [name]: { data: null, loading: false, error: e },
      }));
      showToast('장바구니를 불러오는데 실패했습니다', 'error');
    }
  }, [name, setState]);

  useEffect(() => {
    if (!state[name]) request();
  }, [request, state, name]);

  const resource = state[name] || {
    data: null,
    loading: false,
    error: null,
  };

  return {
    data: resource.data as T | undefined,
    loading: resource.loading,
    error: resource.error,
    refetch: request,
  };
}
