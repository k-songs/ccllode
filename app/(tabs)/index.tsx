import { Text, View } from "react-native";

export default function HomeTab() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <Text style={{ textAlign: "center", marginBottom: 12, fontSize: 18, fontWeight: "600" }}>
        첫 번째 탭 (index)
      </Text>
      <Text style={{ textAlign: "center", opacity: 0.75 }}>
        새 탭: `app/(tabs)/원하는이름.tsx` 파일을 만든 뒤 저장하면 하단 탭에
        반영됩니다. 라벨·아이콘은 `app/(tabs)/_layout.tsx`에서 `Tabs.Screen`으로
        설정할 수 있습니다.
      </Text>
    </View>
  );
}
