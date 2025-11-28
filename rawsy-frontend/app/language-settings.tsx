import { View, StyleSheet, Alert } from 'react-native';
import { Text, Appbar, RadioButton, List, Button, Divider } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { languages, Language } from '../utils/i18n';
import api from '../services/api';

export default function LanguageSettingsScreen() {
  const { theme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [saving, setSaving] = useState(false);

  if (user?.role !== 'manufacturer') {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header elevated>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Language Settings" />
        </Appbar.Header>
        <View style={styles.restrictedContainer}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface, textAlign: 'center' }}>
            Language settings are only available for manufacturers
          </Text>
        </View>
      </View>
    );
  }

  const handleSave = async () => {
    if (selectedLanguage === language) {
      router.back();
      return;
    }

    try {
      setSaving(true);

      await api.put('/auth/language', { language: selectedLanguage });

      await setLanguage(selectedLanguage);

      Alert.alert('Success', 'Language updated successfully');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update language');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('selectLanguage')} />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          Choose your preferred language for the app interface
        </Text>

        <Divider style={styles.divider} />

        <List.Section>
          <RadioButton.Group onValueChange={(value) => setSelectedLanguage(value as Language)} value={selectedLanguage}>
            {languages.map((lang) => (
              <List.Item
                key={lang.code}
                title={lang.label}
                titleStyle={{ fontSize: 16 }}
                left={(props) => (
                  <RadioButton.Android {...props} value={lang.code} />
                )}
                onPress={() => setSelectedLanguage(lang.code as Language)}
                style={[
                  styles.languageItem,
                  selectedLanguage === lang.code && { backgroundColor: theme.colors.primaryContainer }
                ]}
              />
            ))}
          </RadioButton.Group>
        </List.Section>

        <View style={styles.infoBox}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 20 }}>
            Note: Language selection is only available for manufacturers. Suppliers will always see English.
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
        >
          {t('save')}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  description: {
    marginBottom: 8,
    lineHeight: 20,
  },
  divider: {
    marginVertical: 16,
  },
  languageItem: {
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  infoBox: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  saveButton: {
    paddingVertical: 8,
  },
});
