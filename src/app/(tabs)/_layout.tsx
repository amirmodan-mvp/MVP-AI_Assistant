import { Tabs } from 'expo-router';
import { BookOpen, CheckCircle2, Home, Menu, Sparkles } from 'lucide-react-native';
import { Colors } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.purple,
        tabBarInactiveTintColor: '#AAA4AE',
        tabBarStyle: {
          height: 64,
          paddingTop: 5,
          paddingBottom: 6,
          borderTopColor: '#EEEBED',
          backgroundColor: '#FFFFFF',
        },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="ai" options={{ title: 'Ask AI', tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} /> }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks', tabBarIcon: ({ color, size }) => <CheckCircle2 color={color} size={size} /> }} />
      <Tabs.Screen name="notes" options={{ title: 'Notes', tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} /> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color, size }) => <Menu color={color} size={size} /> }} />
    </Tabs>
  );
}
