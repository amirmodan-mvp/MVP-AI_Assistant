import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#FBFAF8" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
