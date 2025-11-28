/*
import { View, StyleSheet } from 'react-native';
import { Text, Button, Avatar, useTheme as usePaperTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme } = useTheme(); // custom ThemeContext
  const paperTheme = usePaperTheme(); // react-native-paper theme

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const formatRole = (role?: string) =>
    role ? role.charAt(0).toUpperCase() + role.slice(1) : '';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Avatar.Text
        size={80}
        label={user?.name?.charAt(0).toUpperCase() || 'U'}
        style={{ ...styles.avatar, backgroundColor: theme.colors.primary }}
        color={theme.colors.onPrimary}
      />

      <Text variant="headlineSmall" style={[styles.name, { color: theme.colors.onBackground }]}>
        {user?.name}
      </Text>

      <View style={[styles.infoContainer, { backgroundColor: theme.colors.surface }]}>
        {user?.email && (
          <Text variant="bodyMedium" style={[styles.info, { color: theme.colors.onSurface }]}>
            Email: {user.email}
          </Text>
        )}
        {user?.phone && (
          <Text variant="bodyMedium" style={[styles.info, { color: theme.colors.onSurface }]}>
            Phone: {user.phone}
          </Text>
        )}
        <Text variant="bodyMedium" style={[styles.info, { color: theme.colors.onSurface }]}>
          Role: {formatRole(user?.role)}
        </Text>
        <Text variant="bodyMedium" style={[styles.info, { color: theme.colors.onSurface }]}>
          Status: {user?.status}
        </Text>
        {user?.companyName && (
          <Text variant="bodyMedium" style={[styles.info, { color: theme.colors.onSurface }]}>
            Company: {user.companyName}
          </Text>
        )}
      </View>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.button}
        buttonColor={theme.colors.error}
        textColor={theme.colors.onError}
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  avatar: {
    marginBottom: 20,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  info: {
    marginBottom: 10,
  },
  button: {
    width: '100%',
    paddingVertical: 8,
  },
});
*/