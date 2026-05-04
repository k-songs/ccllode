import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";

/**
 * 하단 탭: 새 화면은 `app/(tabs)/파일명.tsx` 추가 후, 아래에 Tabs.Screen을 맞춰 주면 됩니다.
 * (파일만 두면 자동 노출되기도 하지만, 제목·아이콘을 쓰려면 Screen 선언이 편합니다.)
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "더보기",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="more-horiz" color={color} size={size ?? 24} />
          ),
        }}
      />
    </Tabs>
  );
}
