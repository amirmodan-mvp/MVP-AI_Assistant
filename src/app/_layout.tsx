import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TaskProvider } from '../context/TaskContext';

export default function RootLayout() {
  return (
    <TaskProvider>
      <StatusBar style="dark" backgroundColor="#FBFAF8" />
      <Stack screenOptions={{ headerShown: false }} />
    </TaskProvider>
  );
}
