import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

type Task = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
};

const STORAGE_KEY = "taskflow.mobile.tasks";
const WEB_URL = "http://localhost:3000";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setTasks(JSON.parse(raw) as Task[]);
      } catch {
        /* ignore corrupt storage */
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(async (next: Task[]) => {
    setTasks(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addTask = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const task: Task = {
      id: `${Date.now()}`,
      title: trimmed,
      done: false,
      createdAt: new Date().toISOString(),
    };
    setTitle("");
    await persist([task, ...tasks]);
  };

  const toggleTask = async (id: string) => {
    await persist(
      tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const removeTask = async (id: string) => {
    await persist(tasks.filter((t) => t.id !== id));
  };

  const open = tasks.filter((t) => !t.done).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>TaskFlow</Text>
          <Text style={styles.subtitle}>Minimal Android companion</Text>
          <Text style={styles.stats}>{ready ? `${open} open · ${tasks.length} total` : "Loading…"}</Text>
        </View>

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Quick add a task…"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
            onSubmitEditing={addTask}
            returnKeyType="done"
          />
          <Pressable style={styles.addBtn} onPress={addTask}>
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No tasks yet. Add one above.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable style={styles.cardMain} onPress={() => toggleTask(item.id)}>
                <View style={[styles.check, item.done && styles.checkOn]}>
                  {item.done ? <Text style={styles.checkMark}>✓</Text> : null}
                </View>
                <Text style={[styles.cardTitle, item.done && styles.cardDone]}>
                  {item.title}
                </Text>
              </Pressable>
              <Pressable onPress={() => removeTask(item.id)} hitSlop={8}>
                <Text style={styles.delete}>Delete</Text>
              </Pressable>
            </View>
          )}
        />

        <Pressable style={styles.linkBtn} onPress={() => Linking.openURL(WEB_URL)}>
          <Text style={styles.linkText}>Open full TaskFlow web app</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  flex: { flex: 1 },
  header: {
    backgroundColor: "#1E1B4B",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  brand: { color: "#fff", fontSize: 28, fontWeight: "800" },
  subtitle: { color: "#C4B5FD", marginTop: 4, fontSize: 14 },
  stats: { color: "#E2E8F0", marginTop: 12, fontSize: 13, fontWeight: "600" },
  composer: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0F172A",
  },
  addBtn: {
    backgroundColor: "#6366F1",
    borderRadius: 14,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "700" },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  empty: { textAlign: "center", color: "#64748B", marginTop: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cardMain: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  checkOn: { backgroundColor: "#6366F1", borderColor: "#6366F1" },
  checkMark: { color: "#fff", fontSize: 12, fontWeight: "800" },
  cardTitle: { color: "#0F172A", fontSize: 15, fontWeight: "600", flexShrink: 1 },
  cardDone: { color: "#94A3B8", textDecorationLine: "line-through" },
  delete: { color: "#E11D48", fontSize: 12, fontWeight: "700" },
  linkBtn: {
    margin: 16,
    marginTop: 0,
    backgroundColor: "#EEF2FF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  linkText: { color: "#4338CA", fontWeight: "700" },
});
