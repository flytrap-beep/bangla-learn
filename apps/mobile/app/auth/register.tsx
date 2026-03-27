import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { registerWithEmail } from "@/lib/auth";
import { pushProgressToFirestore } from "@/lib/sync";
import { T } from "@/lib/theme";

const BD_GREEN = T.green;

export default function RegisterScreen() {
  const router = useRouter();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || password.length < 6) return;
    setLoading(true); setError(null);
    try {
      // registerWithEmail upgrades anonymous account → preserves all local progress
      await registerWithEmail(email.trim(), password, name.trim());
      // Push existing local progress to Firestore immediately
      await pushProgressToFirestore();
      router.back();
    } catch (e: any) {
      const msg = e.code === "auth/email-already-in-use"
        ? "An account with this email already exists"
        : e.code === "auth/invalid-email"
        ? "Please enter a valid email"
        : e.code === "auth/weak-password"
        ? "Password must be at least 6 characters"
        : "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const valid = name.trim().length > 0 && email.trim().length > 0 && password.length >= 6;

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>

          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="flag" size={32} color="#fff" />
            </View>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Your progress is safe — creating an account just syncs it across your devices
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark-outline" size={18} color={BD_GREEN} />
            <Text style={styles.infoText}>
              All your lessons and XP are already saved locally and will be synced to your new account.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Your name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="E.g. Alex"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password (min. 6 characters)</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Choose a password"
                  placeholderTextColor="#9ca3af"
                  style={[styles.input, { flex: 1, borderWidth: 0 }]}
                  secureTextEntry={!showPass}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
                <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={{ padding: 12 }}>
                  <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, (!valid || loading) && { opacity: 0.6 }]}
              onPress={handleRegister}
              disabled={!valid || loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.primaryBtnText}>Create Account & Sync Progress</Text>
              }
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Already have an account?</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.replace("/auth/login" as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryBtnText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: "#fff" },
  scroll:  { padding: 24, paddingTop: 16 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  hero:    { alignItems: "center", marginBottom: 20, marginTop: 8 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: BD_GREEN,
    alignItems: "center", justifyContent: "center",
    marginBottom: 18,
    shadowColor: BD_GREEN, shadowOffset: { width:0, height:6 }, shadowOpacity:0.35, elevation:8,
  },
  title:    { fontSize: 28, fontWeight: "900", color: "#1f2937", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#6b7280", textAlign: "center", lineHeight: 20 },
  infoBox:  {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "#f0fdf4", borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: "#4ade80", marginBottom: 20,
  },
  infoText: { fontSize: 13, color: "#166534", flex: 1, lineHeight: 18 },
  form:       { gap: 16 },
  fieldGroup: { gap: 6 },
  label:      { fontSize: 13, fontWeight: "700", color: "#374151" },
  input: {
    borderWidth: 2, borderColor: "#e5e7eb", borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: "#1f2937", backgroundColor: "#f9fafb",
  },
  passwordRow: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 2, borderColor: "#e5e7eb", borderRadius: 14,
    backgroundColor: "#f9fafb", overflow: "hidden",
  },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#fef2f2", borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: "#fca5a5",
  },
  errorText: { fontSize: 13, color: "#dc2626", flex: 1 },
  primaryBtn: {
    backgroundColor: BD_GREEN, borderRadius: 16, paddingVertical: 17,
    alignItems: "center", marginTop: 8,
    shadowColor: BD_GREEN, shadowOffset: { width:0, height:4 }, shadowOpacity:0.3, elevation:5,
  },
  primaryBtnText:   { color: "#fff", fontWeight: "800", fontSize: 15 },
  divider:          { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine:      { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  dividerText:      { fontSize: 13, color: "#9ca3af", fontWeight: "600" },
  secondaryBtn:     { borderWidth: 2, borderColor: "#e5e7eb", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  secondaryBtnText: { fontWeight: "700", fontSize: 15, color: "#374151" },
});
