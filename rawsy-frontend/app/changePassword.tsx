import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Appbar, useTheme as usePaperTheme, Text, HelperText, Surface, ProgressBar } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useRouter } from "expo-router";
import api from "../services/api";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
}

export default function ChangePasswordScreen() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const paperTheme = usePaperTheme();
  const { t } = useLanguage();
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const checkPasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, label: "", color: "#9ca3af", suggestions: [] };
    }

    let score = 0;
    const suggestions: string[] = [];

    if (password.length >= 8) score += 1;
    else suggestions.push("Use at least 8 characters");

    if (password.length >= 12) score += 1;

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    else suggestions.push("Include both uppercase and lowercase letters");

    if (/\d/.test(password)) score += 1;
    else suggestions.push("Include at least one number");

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else suggestions.push("Include at least one special character");

    let label = "";
    let color = "#9ca3af";

    if (score <= 1) {
      label = "Weak";
      color = "#ef4444";
    } else if (score === 2) {
      label = "Fair";
      color = "#f59e0b";
    } else if (score === 3) {
      label = "Good";
      color = "#3b82f6";
    } else if (score >= 4) {
      label = "Strong";
      color = "#10b981";
    }

    return { score, label, color, suggestions };
  };

  const passwordStrength = checkPasswordStrength(newPassword);

  const validateForm = (): boolean => {
    const newErrors = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!oldPassword) {
      newErrors.oldPassword = "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (newPassword === oldPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return !newErrors.oldPassword && !newErrors.newPassword && !newErrors.confirmPassword;
  };

  const handleChangePassword = async () => {
    if (!token) {
      Alert.alert("Error", "You are not logged in");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await api.put("/auth/me/change-password", {
        oldPassword,
        newPassword,
      });

      Alert.alert(
        "Success",
        "Password changed successfully",
        [
          {
            text: "OK",
            onPress: () => {
              setOldPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setErrors({ oldPassword: "", newPassword: "", confirmPassword: "" });
              router.back();
            },
          },
        ]
      );
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || "Failed to change password";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Change Password" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Surface style={[styles.infoCard, { backgroundColor: paperTheme.colors.primaryContainer }]} elevation={1}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="info" size={20} color={paperTheme.colors.primary} />
            <Text variant="titleSmall" style={[styles.infoTitle, { color: paperTheme.colors.onPrimaryContainer }]}>
              Password Requirements
            </Text>
          </View>
          <Text variant="bodySmall" style={{ color: paperTheme.colors.onPrimaryContainer, lineHeight: 20 }}>
            Your password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters for better security.
          </Text>
        </Surface>

        <TextInput
          label="Current Password"
          value={oldPassword}
          onChangeText={(text) => {
            setOldPassword(text);
            if (errors.oldPassword) setErrors({ ...errors, oldPassword: "" });
          }}
          secureTextEntry={!showOld}
          right={<TextInput.Icon icon={showOld ? "eye-off" : "eye"} onPress={() => setShowOld(!showOld)} />}
          style={styles.input}
          mode="outlined"
          error={!!errors.oldPassword}
          theme={{ colors: { text: paperTheme.colors.onSurface, primary: paperTheme.colors.primary } }}
        />
        {errors.oldPassword ? (
          <HelperText type="error" visible={!!errors.oldPassword} style={styles.errorText}>
            {errors.oldPassword}
          </HelperText>
        ) : null}

        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            if (errors.newPassword) setErrors({ ...errors, newPassword: "" });
          }}
          secureTextEntry={!showNew}
          right={<TextInput.Icon icon={showNew ? "eye-off" : "eye"} onPress={() => setShowNew(!showNew)} />}
          style={styles.input}
          mode="outlined"
          error={!!errors.newPassword}
          theme={{ colors: { text: paperTheme.colors.onSurface, primary: paperTheme.colors.primary } }}
        />
        {errors.newPassword ? (
          <HelperText type="error" visible={!!errors.newPassword} style={styles.errorText}>
            {errors.newPassword}
          </HelperText>
        ) : null}

        {newPassword.length > 0 && (
          <Surface style={styles.strengthCard} elevation={0}>
            <View style={styles.strengthHeader}>
              <Text variant="labelMedium" style={styles.strengthLabel}>
                Password Strength:
              </Text>
              <Text variant="labelMedium" style={[styles.strengthValue, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </Text>
            </View>
            <ProgressBar
              progress={passwordStrength.score / 5}
              color={passwordStrength.color}
              style={styles.strengthBar}
            />
            {passwordStrength.suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {passwordStrength.suggestions.map((suggestion, index) => (
                  <View key={index} style={styles.suggestionItem}>
                    <MaterialIcons name="circle" size={6} color="#6b7280" />
                    <Text variant="bodySmall" style={styles.suggestionText}>
                      {suggestion}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Surface>
        )}

        <TextInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
          }}
          secureTextEntry={!showConfirm}
          right={<TextInput.Icon icon={showConfirm ? "eye-off" : "eye"} onPress={() => setShowConfirm(!showConfirm)} />}
          style={styles.input}
          mode="outlined"
          error={!!errors.confirmPassword}
          theme={{ colors: { text: paperTheme.colors.onSurface, primary: paperTheme.colors.primary } }}
        />
        {errors.confirmPassword ? (
          <HelperText type="error" visible={!!errors.confirmPassword} style={styles.errorText}>
            {errors.confirmPassword}
          </HelperText>
        ) : null}

        {confirmPassword.length > 0 && confirmPassword === newPassword && (
          <View style={styles.matchIndicator}>
            <MaterialIcons name="check-circle" size={16} color="#10b981" />
            <Text variant="bodySmall" style={[styles.matchText, { color: "#10b981" }]}>
              Passwords match
            </Text>
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleChangePassword}
          loading={loading}
          disabled={loading}
          style={styles.button}
          icon="lock-reset"
        >
          Change Password
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontWeight: "600",
  },
  input: { marginBottom: 4 },
  errorText: {
    marginTop: 0,
    marginBottom: 12,
  },
  strengthCard: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  strengthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  strengthLabel: {
    color: "#4b5563",
  },
  strengthValue: {
    fontWeight: "700",
  },
  strengthBar: {
    height: 8,
    borderRadius: 4,
  },
  suggestionsContainer: {
    marginTop: 12,
    gap: 6,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  suggestionText: {
    color: "#6b7280",
    flex: 1,
  },
  matchIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    marginBottom: 12,
  },
  matchText: {
    fontWeight: "500",
  },
  button: { marginTop: 8, paddingVertical: 8 },
});
