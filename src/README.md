# Apartment Management — Expo Router

This is the 992-line apartment-management prototype reorganized as a real Expo Router app.

## Route structure

```text
app/
├── _layout.tsx
└── (tabs)/
    ├── _layout.tsx
    ├── index.tsx
    ├── pay.tsx
    ├── maintenance.tsx
    ├── amenities.tsx
    └── more.tsx
```

## Supporting code

```text
components/
├── StatusBadge.tsx
├── SeverityBar.tsx
└── Header.tsx

data/
└── apartment.ts

types/
└── apartment.ts
```

## Run

```bash
npm install
npx expo start
```

For Android:

```bash
npx expo start --android
```

For iOS:

```bash
npx expo start --ios
```

## What changed from the original App.tsx

- The five screens are now real Expo Router routes.
- `(tabs)/_layout.tsx` owns the bottom tab navigator.
- The original `useState<Tab>` navigation was removed.
- Home quick actions use Expo Router navigation.
- The original web-only elements (`div`, `button`, `img`, `textarea`) were converted to React Native components.
- `lucide-react` icons were replaced with `@expo/vector-icons` so the project is native Expo-compatible.
- Data and reusable UI were moved out of the route files.
- The original apartment demo data and screen flows were preserved.
- The original browser-only PhoneFrame/status bar were intentionally removed because an Expo Router app already runs inside the device viewport and has its own system UI/tab navigation.
