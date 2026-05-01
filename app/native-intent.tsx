import { Redirect } from 'expo-router';

export function redirectSystemPath({
  path,
  initial,
}: { path: string; initial: boolean }) {
  return '/';
}

export default function NativeIntentScreen() {
  return <Redirect href="/" />;
}