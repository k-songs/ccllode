# 초기 화면 렌더링 흐름 (RN + Expo Router)

> 이 문서는 `claude_rn_test` 앱이 켜질 때, 첫 화면이 어떤 순서로 그려지는지를 코드 한 줄 한 줄 따라가며 대화체로 풀어쓴 글이에요. 실생활 비유는 대괄호로 표시했어요.

---

## 0. 큰 그림부터 한 컷

> [비유] 앱 실행은 마치 **택배 배송**과 같아요.
> - 출발 송장(`package.json`) → 분류 센터(Expo Router) → 큰 박스(RootLayout) → 작은 박스(TabLayout) → 내용물(HomeScreen) 순서로 점점 안쪽으로 들어가요.

```
📦 package.json (main 진입점)
   └─ expo-router/entry (파일 기반 라우팅 시작)
        └─ app/_layout.tsx          ← RootLayout (앱 전체 껍데기)
             └─ app/(tabs)/_layout.tsx   ← TabLayout (하단 탭 껍데기)
                  └─ app/(tabs)/index.tsx ← HomeScreen (실제 첫 화면)
                       └─ ParallaxScrollView
                            └─ ThemedView / ThemedText / HelloWave / Image ...
```

---

## 1. 진입점: `package.json`

```13:14:rn/claude_rn_test/package.json
  "name": "claude_rn_test",
  "main": "expo-router/entry",
```

- `"main": "expo-router/entry"` 가 가장 처음 실행돼요.
- 이 한 줄이 **"파일 기반 라우터로 앱을 시작해"** 라고 알려주는 신호예요.

> [비유] 택배 송장에 "배송 방식: 파일 기반 라우팅" 이라고 적혀 있는 거예요. Expo Router는 이 신호를 받고 `app/` 폴더를 스캔해서 라우트를 자동으로 만들어요.

---

## 2. 앱 설정: `app.json`

```28:46:rn/claude_rn_test/app.json
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          ...
        }
      ]
    ],
```

- `expo-router` 플러그인 → 파일 기반 라우팅 활성화
- `expo-splash-screen` → 앱 켜질 때 잠깐 보이는 **스플래시 이미지** 설정
- `"newArchEnabled": true` → New Architecture (Fabric/TurboModules) 사용
- `"userInterfaceStyle": "automatic"` → OS 다크/라이트 모드 자동 따라감

> [비유] "택배 차에 자동 색상 감지 센서를 달았어요." → 폰이 다크 모드면 앱도 다크, 라이트면 앱도 라이트로 자동 바뀌어요.

---

## 3. 가장 바깥 껍데기: `app/_layout.tsx` (RootLayout)

Expo Router는 `app/` 폴더 안의 `_layout.tsx`를 **모든 화면의 공통 껍데기**로 사용해요.

```1:24:rn/claude_rn_test/app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
```

### 한 줄씩 해석

1. **`import 'react-native-reanimated';`**
   - Reanimated를 가장 위에서 불러와요. 애니메이션을 쓸 수 있게 미리 준비.
   - > [비유] 요리 시작 전에 가스 밸브부터 여는 거예요.

2. **`useColorScheme()`**
   - 지금 폰이 다크 모드인지 라이트 모드인지 읽어와요.
   - > [비유] 방의 조명 상태를 확인하는 센서.

3. **`<ThemeProvider value={...}>`**
   - 앱 전체에 "지금은 다크 / 라이트" 라는 정보를 뿌려줘요.
   - > [비유] 빌딩 전체에 "오늘은 야간 모드" 라고 방송 거는 것.

4. **`<Stack>` + `<Stack.Screen name="(tabs)" ... />`**
   - 화면을 **쌓아올리는 카드 형태**의 네비게이터예요.
   - `(tabs)` 라는 그룹과 `modal` 화면 두 개를 등록해뒀어요.
   - `headerShown: false` → `(tabs)` 위쪽엔 별도 헤더 안 그림 (탭 안에 또 헤더가 있으니까).

5. **`unstable_settings = { anchor: '(tabs)' }`**
   - 이게 **포인트!** "딥링크나 새로고침 시 기본 화면을 `(tabs)` 로 잡아라" 라는 뜻.
   - > [비유] "기본 출발지는 1층 로비예요" 라고 빌딩 안내데스크에 적어둔 것.

6. **`<StatusBar style="auto" />`**
   - 폰 위쪽 상태바(시계, 배터리) 색상을 자동 조절해요.

> 정리: RootLayout은 **앱 전체의 테마 + 상태바 + 네비게이션 스택**을 깔아주는 가장 바깥 껍데기예요.

---

## 4. 두 번째 껍데기: `app/(tabs)/_layout.tsx` (TabLayout)

`unstable_settings.anchor: '(tabs)'` 때문에 라우터는 `(tabs)` 폴더로 들어가요. 이 폴더에도 `_layout.tsx`가 있죠.

```1:35:rn/claude_rn_test/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
```

### 핵심 동작

1. **`<Tabs>`** : 하단 탭 네비게이터. 두 개의 탭(`index`, `explore`)을 만들어요.
2. **`tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint`**
   - 다크 모드면 흰색(`#fff`), 라이트 모드면 청록색(`#0a7ea4`).
   - > [비유] 메뉴판에서 "오늘 추천 메뉴" 표시 색상을 시간대별로 바꾸는 것.
3. **`tabBarButton: HapticTab`**
   - 탭을 누를 때 iOS에서는 "톡!" 하는 진동(햅틱)이 와요. **(Android에서는 동작 안 함)**
4. **`name="index"`** → `index.tsx` 파일과 매칭됨. 이게 **첫 번째 탭이자 기본 화면**이에요.

> [비유] 1층 로비에 들어왔더니, 두 개의 문(Home / Explore)이 보이고, 기본은 "Home" 문이 활짝 열려있는 상태예요.

---

## 5. 진짜 첫 화면: `app/(tabs)/index.tsx` (HomeScreen)

```10:79:rn/claude_rn_test/app/(tabs)/index.tsx
export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      ...
    </ParallaxScrollView>
  );
}
```

### 렌더링되는 자식 구조

```
ParallaxScrollView
├─ headerImage: <Image (partial-react-logo.png)>
└─ children:
   ├─ ThemedView (titleContainer)
   │   ├─ ThemedText "Welcome!" (type=title)
   │   └─ HelloWave 👋 (애니메이션)
   ├─ ThemedView (stepContainer) — Step 1: Try it
   ├─ ThemedView (stepContainer) — Step 2: Explore (with Link to /modal)
   └─ ThemedView (stepContainer) — Step 3: Get a fresh start
```

> [비유] 큰 스크롤 박스(`ParallaxScrollView`) 안에 "환영 인사 카드 + 안내 카드 3장" 이 차곡차곡 들어있는 거예요.

---

## 6. 헤더가 살아 움직이는 비밀: `ParallaxScrollView`

```21:69:rn/claude_rn_test/components/parallax-scroll-view.tsx
export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const backgroundColor = useThemeColor({}, "background");
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1],
          ),
        },
      ],
    };
  });

  return (
    <Animated.ScrollView ref={scrollRef} ...>
      <Animated.View style={[styles.header, { backgroundColor: "orange" }, headerAnimatedStyle]}>
        {headerImage}
      </Animated.View>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </Animated.ScrollView>
  );
}
```

### 한 단계씩 풀어보기

1. **`useThemeColor({}, "background")`** → 다크/라이트에 맞는 배경색을 가져와요.
2. **`useAnimatedRef` + `useScrollOffset`** → 사용자가 지금 얼마나 스크롤했는지 실시간으로 추적.
3. **`useAnimatedStyle`** → 스크롤 양에 따라 **헤더의 위치(translateY)와 크기(scale)를 자동 계산**해요.
   - 위로 당기면(`-HEADER_HEIGHT`): 헤더가 **2배로 확대**되며 살짝 위로.
   - 그대로(`0`): 원래 크기.
   - 아래로 스크롤(`+HEADER_HEIGHT`): 헤더가 위로 사라지듯 올라감.
   - > [비유] **자동차 와이퍼**처럼 스크롤 위치에 따라 헤더가 움직이고 늘어나요. 이게 "패럴랙스(Parallax)" 효과.
4. **`<Animated.View>` (header)** → 오렌지 배경 + 리액트 로고 이미지가 들어있는 헤더 박스 (높이 250).
5. **`<ThemedView style={styles.content}>{children}</ThemedView>`** → 헤더 아래쪽에 자식들(환영 카드 + 3장)을 padding 32, gap 16 으로 배치.

> 한 줄 요약: ScrollView 안에 "움직이는 헤더 + 본문" 두 덩어리가 들어가 있고, 손가락 스크롤 위치를 보고 헤더가 살아 움직여요.

---

## 7. 색상이 자동으로 바뀌는 이유: `ThemedView` / `ThemedText`

`HomeScreen`에서 쓰인 `<ThemedView>`, `<ThemedText>`는 그냥 `View`, `Text`가 아니에요. **테마(다크/라이트)에 따라 색이 자동으로 바뀌는 똑똑한 컴포넌트**예요.

### `ThemedView`

```10:14:rn/claude_rn_test/components/themed-view.tsx
export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
```

### `ThemedText`

```11:34:rn/claude_rn_test/components/themed-text.tsx
export function ThemedText({
  style, lightColor, darkColor, type = 'default', ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        ...
        style,
      ]}
      {...rest}
    />
  );
}
```

- `type` prop에 따라 미리 정해둔 스타일(title, subtitle, defaultSemiBold 등)이 적용돼요.
- 색상은 `useThemeColor`로 자동 결정.

### 진짜 색을 정하는 곳: `useThemeColor`

```9:21:rn/claude_rn_test/hooks/use-theme-color.ts
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
```

- 1순위: 컴포넌트가 직접 넘긴 색 (`lightColor`, `darkColor`)
- 2순위: `Colors[theme][colorName]` (전역 팔레트)

### 팔레트: `constants/theme.ts`

```11:28:rn/claude_rn_test/constants/theme.ts
export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    ...
  },
};
```

> [비유] 식당 메뉴판이 두 개 있어요. "낮 메뉴(light)"와 "밤 메뉴(dark)". 손님(`useColorScheme`)이 들어오면 자동으로 알맞은 메뉴판을 펼쳐 보여주는 거예요.

---

## 8. 손 흔드는 이모지: `HelloWave`

```3:19:rn/claude_rn_test/components/hello-wave.tsx
export function HelloWave() {
  return (
    <Animated.Text
      style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      👋
    </Animated.Text>
  );
}
```

- Reanimated의 CSS 스타일 애니메이션을 이용해 **300ms 동안 25도 회전을 4번 반복**해요.
- > [비유] 친구가 "안녕!" 하고 손을 4번 흔들고 멈추는 거예요.

---

## 9. 전체 렌더링 순서 (한눈에)

```
[1] 앱 실행
       │
       ▼
[2] package.json → "main": "expo-router/entry"
       │
       ▼
[3] app.json (splash, plugins, newArch) 적용
       │
       ▼
[4] app/_layout.tsx → RootLayout 실행
       │  ├─ useColorScheme() 으로 다크/라이트 판단
       │  ├─ ThemeProvider 깔기
       │  └─ <Stack> 등록 + unstable_settings.anchor='(tabs)' 로 시작점 지정
       │
       ▼
[5] app/(tabs)/_layout.tsx → TabLayout 실행
       │  ├─ <Tabs> 하단 탭 두 개 등록 (index, explore)
       │  └─ 기본 활성 탭 = 'index'
       │
       ▼
[6] app/(tabs)/index.tsx → HomeScreen 실행
       │
       ▼
[7] <ParallaxScrollView> 마운트
       │  ├─ useThemeColor 로 배경색 결정
       │  ├─ useAnimatedRef + useScrollOffset 로 스크롤 추적 준비
       │  ├─ useAnimatedStyle 로 헤더 transform 계산
       │  ├─ Animated.View(header) + Image(react-logo) 그리기
       │  └─ ThemedView(content) 안에 children 렌더링
       │
       ▼
[8] children 차례로 렌더링
       │  ├─ ThemedView "Welcome!" + HelloWave (👋 애니메이션 시작)
       │  ├─ ThemedView Step 1: Try it
       │  ├─ ThemedView Step 2: Explore (Link → /modal)
       │  └─ ThemedView Step 3: Get a fresh start
       │
       ▼
[9] 스플래시 화면 사라지고, 사용자에게 첫 화면 표시 완료!
```

---

## 10. 핵심 포인트 정리

| # | 파일 | 역할 |
|---|---|---|
| 1 | `package.json` | 진입점을 `expo-router/entry`로 지정 |
| 2 | `app.json` | 스플래시, 플러그인, 새 아키텍처 설정 |
| 3 | `app/_layout.tsx` | 앱 전체 테마 + Stack 네비게이션 + 시작 anchor 지정 |
| 4 | `app/(tabs)/_layout.tsx` | 하단 탭 (Home, Explore) 네비게이션 |
| 5 | `app/(tabs)/index.tsx` | **첫 화면 (HomeScreen)** |
| 6 | `components/parallax-scroll-view.tsx` | 스크롤 시 살아 움직이는 헤더 + 본문 컨테이너 |
| 7 | `components/themed-view.tsx`, `themed-text.tsx` | 다크/라이트 자동 색상 적응 컴포넌트 |
| 8 | `hooks/use-theme-color.ts` | 실제로 색을 결정하는 핵심 훅 |
| 9 | `constants/theme.ts` | 라이트/다크 색상 팔레트 |
| 10 | `components/hello-wave.tsx` | 환영 화면의 👋 애니메이션 |

> **핵심 흐름 한 문장**: `package.json` → `RootLayout`(테마/스택) → `TabLayout`(하단 탭) → `HomeScreen`(첫 화면) → `ParallaxScrollView`(헤더 + 본문) → `ThemedView/Text` 자식들이 차례로 그려져요.














