// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Layout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false, // Show header for all screens
          animation: "fade",
        }}
      />
      <StatusBar style="auto" />
    </>
  );
}
