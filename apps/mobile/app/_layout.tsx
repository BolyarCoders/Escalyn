import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Layout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#17255A", // your app background
          },
        }}
      />
      <StatusBar style="light" />
    </>
  );
}
