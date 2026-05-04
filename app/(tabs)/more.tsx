import { Text, View } from "react-native";

export default function MoreTab() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>더보기 탭</Text>
      <Text style={{ opacity: 0.75, textAlign: "center" }}>
        `app/(tabs)/more.tsx` 화면입니다. 제목·아이콘은 `_layout.tsx`의 Tabs.Screen에서
        바꿀 수 있습니다.
      </Text>
    </View>
  );
}
