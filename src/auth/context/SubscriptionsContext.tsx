import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useContext,
  ReactNode,
} from "react";
import { useTenant } from "../hooks/useTenant";
import { useAuth } from "./AuthContext";
import { combineUrlAndPath } from "../utils/combineUrlAndPath";
import { REACT_APP_SUBSCRIPTIONS_API } from "../../env";

interface Subscription {
  id: number;
  app_id: string;
  name: string;
  currency: string;
  price: number;
}

interface UserSubscription {
  id: number;
  user_id: number;
  subscription_id: number;
  name: string;
  started: number;
  start_date: string;
  expiry_date: string;
  active: number;
}

interface Credit {
  id: number;
  user_id: number;
  name: string;
  value: number;
}

interface SubscriptionsContextType {
  subscriptions: Subscription[];
  userSubscriptions: UserSubscription[];
  userCredits: Credit[];
  loading: boolean;
  fetchSubscriptions: () => Promise<void>;
  fetchUserSubscriptions: () => Promise<void>;
  fetchUserCredits: () => Promise<void>;
  purchaseSubscription: (subscriptionId: string) => Promise<any>;
  useCredits: (amount: number) => Promise<any>;
  getUserCreditValue: (name: string) => number;
  hasActiveSubscription: () => boolean;
  createOrder: (subscriptionItems: Subscription[]) => Promise<any>;
}

interface SubscriptionsProviderProps {
  children: ReactNode;
  onError?: (message: string, error: any) => void;
}

const SubscriptionsContext = createContext<SubscriptionsContextType | null>(
  null
);

export const useSubscriptions = (): SubscriptionsContextType => {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error(
      "useSubscriptions must be used within a SubscriptionsProvider"
    );
  }
  return context;
};

const SubscriptionsProvider: React.FC<SubscriptionsProviderProps> = ({
  children,
  onError,
}) => {
  const { tenant } = useTenant();
  const { user, token } = useAuth();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>(
    []
  );
  const [userCredits, setUserCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSubscriptions = async () => {
    if (!tenant) return;

    setLoading(true);
    try {
      const response = await fetch(
        combineUrlAndPath(
          REACT_APP_SUBSCRIPTIONS_API,
          "api.php/subscriptions/"
        ),
        {
          headers: {
            "Content-Type": "application/json",
            APP_ID: tenant,
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          method: "GET",
        }
      );
      const data = await response.json();
      setSubscriptions(data);
    } catch (err) {
      if (onError) {
        onError("Subscriptions: Unable to fetch subscriptions", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubscriptions = async () => {
    if (!tenant || !user?.id || !token) return;

    setLoading(true);
    try {
      const response = await fetch(
        combineUrlAndPath(
          REACT_APP_SUBSCRIPTIONS_API,
          `api.php/user/${user.id}/subscriptions`
        ),
        {
          headers: {
            "Content-Type": "application/json",
            APP_ID: tenant,
            Authorization: `Bearer ${token}`,
          },
          method: "GET",
        }
      );
      const data = await response.json();
      setUserSubscriptions(data);
    } catch (err) {
      if (onError) {
        onError("Subscriptions: Unable to fetch user subscriptions", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCredits = async () => {
    if (!tenant || !user?.id || !token) return;

    setLoading(true);
    try {
      const response = await fetch(
        combineUrlAndPath(
          REACT_APP_SUBSCRIPTIONS_API,
          `api.php/user/${user.id}/credits`
        ),
        {
          headers: {
            "Content-Type": "application/json",
            APP_ID: tenant,
            Authorization: `Bearer ${token}`,
          },
          method: "GET",
        }
      );
      const data = await response.json();
      setUserCredits(data);
    } catch (err) {
      if (onError) {
        onError("Subscriptions: Unable to fetch user credits", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const purchaseSubscription = async (subscriptionId: string) => {
    if (!tenant || !user?.id || !token) return;

    setLoading(true);
    try {
      const response = await fetch(
        combineUrlAndPath(
          REACT_APP_SUBSCRIPTIONS_API,
          `api.php/user/${user.id}/subscription`
        ),
        {
          body: JSON.stringify({ subscription_id: subscriptionId }),
          headers: {
            "Content-Type": "application/json",
            APP_ID: tenant,
            Authorization: `Bearer ${token}`,
          },
          method: "POST",
        }
      );
      const data = await response.json();
      await fetchUserSubscriptions();
      await fetchUserCredits();
      return data;
    } catch (err) {
      if (onError) {
        onError("Subscriptions: Unable to purchase subscription", err);
      }
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const useCredits = async (amount: number) => {
    if (!tenant || !user?.id || !token) return;

    setLoading(true);
    try {
      const response = await fetch(
        combineUrlAndPath(
          REACT_APP_SUBSCRIPTIONS_API,
          `api.php/user/${user.id}/credits/use`
        ),
        {
          body: JSON.stringify({ amount }),
          headers: {
            "Content-Type": "application/json",
            APP_ID: tenant,
            Authorization: `Bearer ${token}`,
          },
          method: "POST",
        }
      );
      const data = await response.json();
      await fetchUserCredits();
      return data;
    } catch (err) {
      if (onError) {
        onError("Subscriptions: Unable to use credits", err);
      }
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (subscriptionItems: Subscription[]) => {
    if (!tenant || !token) return;

    try {
      const response = await fetch(
        combineUrlAndPath(REACT_APP_SUBSCRIPTIONS_API, `createorder.php`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            APP_ID: tenant,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_details: "Subscription",
            status: "pending",
            currency: "ZAR",
            items: subscriptionItems.map((item) => ({
              item_type_id: 5,
              parent_id: null,
              item_id: item.id,
              title: item.name,
              item_description: item.description,
              price: item.price,
              quantity: item.quantity,
              additional: JSON.stringify({ subscription: item.subscription }),
            })),
          }),
        }
      );

      const order = await response.json();
      return order;
    } catch (err) {
      if (onError) {
        onError("Subscriptions: Unable to create order", err);
      }
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [tenant]);

  useEffect(() => {
    if (user?.id && token) {
      fetchUserSubscriptions();
      fetchUserCredits();
    }
  }, [user, token, tenant]);

  const getUserCreditValue = (name: string): number => {
    const credit = userCredits.find((c) => c.name === name);
    return credit ? parseInt(credit.value, 10) : 0;
  };

  const hasActiveSubscription = (): boolean => {
    return userSubscriptions.length > 0;
  };

  const values = useMemo(
    () => ({
      subscriptions,
      userSubscriptions,
      userCredits,
      loading,
      fetchSubscriptions,
      fetchUserSubscriptions,
      fetchUserCredits,
      purchaseSubscription,
      useCredits,
      getUserCreditValue,
      hasActiveSubscription,
      createOrder,
    }),
    [subscriptions, userSubscriptions, userCredits, loading, createOrder]
  );

  return (
    <SubscriptionsContext.Provider value={values}>
      {children}
    </SubscriptionsContext.Provider>
  );
};

export { SubscriptionsContext, SubscriptionsProvider };
