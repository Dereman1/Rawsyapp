import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { ActivityIndicator, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabsLayout() {
  const { isAuthenticated, loading, user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const isSupplier = user?.role === 'supplier';
  const isManufacturer = user?.role === 'manufacturer';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.surfaceVariant,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons name={focused ? "home" : "home-filled"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: isManufacturer ? 'Product' : t('products'),
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons name={focused ? "inventory-2" : "inventory-2"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('cart'),
          href: isManufacturer ? undefined : null,
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons name={focused ? "shopping-cart" : "shopping-cart"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('orders'),
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons name={focused ? "receipt-long" : "receipt-long"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          title: t('quotes'),
          href: isSupplier ? undefined : null,
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons name={focused ? "chat-bubble" : "chat-bubble-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t('account'),
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: t('wishlist'),
          href: null,
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons name={focused ? "favorite" : "favorite-border"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
