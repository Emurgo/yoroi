import * as React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Alert } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { AsyncStorageProvider } from "@yoroi/common";
import { ThemeProvider } from "@yoroi/theme";

import { rootStorage } from "./src/kernel/storage/rootStorage";
import { useMigrations } from "./src/kernel/storage/migrations/useMigrations";
import { themeStorage } from "./src/kernel/config/helpers";

function Shell({ children }: { children: React.ReactNode }) {
  const isMigrated = useMigrations(rootStorage);

  if (!isMigrated) return null;

  return (
    <AsyncStorageProvider storage={rootStorage}>
      <ThemeProvider storage={themeStorage}>
        <View style={styles.container}>{children}</View>
      </ThemeProvider>
    </AsyncStorageProvider>
  );
}

export default function App() {
  return (
    <Shell>
      <StatusBar style="auto" />
      <Text>Welcome! You are authenticated!</Text>
    </Shell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginTop: 20,
    color: "#007AFF",
    fontSize: 16,
  },
});

export function _App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const authenticate = async () => {
    try {
      // Check if hardware supports biometrics
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        Alert.alert(
          "Error",
          "Your device does not support biometric authentication"
        );
        setIsLoading(false);
        return;
      }

      // Check if biometrics are enrolled
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert("Error", "No biometrics enrolled on this device");
        setIsLoading(false);
        return;
      }

      // Authenticate user
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access the app",
        fallbackLabel: "Use passcode",
      });

      setIsAuthenticated(result.success);
      setIsLoading(false);
    } catch (error) {
      console.error("Authentication error:", error);
      Alert.alert("Error", "Authentication failed");
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    authenticate();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text>Authentication Required</Text>
        <Text style={styles.button} onPress={authenticate}>
          Try Again
        </Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Welcome! You are authenticated!</Text>
      <StatusBar style="auto" />
    </View>
  );
}
