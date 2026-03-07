import { Stack } from 'expo-router';

export default function InsightLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerStyle: { backgroundColor: '#FFF5F9' },
        headerTintColor: '#FF6B9D',
        contentStyle: { backgroundColor: '#FFF5F9' },
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="[slug]" options={{ title: 'Article', gestureEnabled: true }} />
    </Stack>
  );
}
