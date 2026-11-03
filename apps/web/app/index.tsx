import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.brand}>VERA</Text>
        <Text style={styles.title}>Vérifier avec des preuves.</Text>
        <Text style={styles.description}>
          Une enquête transparente, des sources consultables et des limites clairement exposées.
        </Text>
        <Text style={styles.status}>Squelette initialisé — les parcours Beta restent à construire.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: 640,
    padding: 32,
    width: "100%",
  },
  brand: { color: "#0F766E", fontSize: 14, fontWeight: "700", letterSpacing: 2 },
  title: { color: "#0F172A", fontSize: 28, fontWeight: "700", marginTop: 16 },
  description: { color: "#475569", fontSize: 16, lineHeight: 24, marginTop: 12 },
  status: { color: "#475569", fontSize: 14, marginTop: 24 },
});
