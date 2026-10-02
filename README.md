# DayOne AI — Expo conversion

This is the native Expo Router conversion of the Figma-generated DayOne AI concept.

## Included

- Expo Router tabs: Home, Ask AI, Tasks, Notes, More
- Native React Native UI instead of HTML/CSS
- Lucide React Native icons
- Native document picker
- Native image picker
- Native clipboard
- Local AI demo response routing
- Task/checklist interactions
- AI memory sheet
- Unit tests for AI response routing

## Run

```bash
npm install
npx expo start
```

## Typecheck

```bash
npm run typecheck
```

## Tests

```bash
npm test
```

## Next conversion step

The original Figma app uses browser SpeechRecognition. Expo does not provide that browser API, so the voice button is intentionally left as a native integration point. Connect a speech-to-text service or native speech-recognition package when the backend is ready.

The AI response logic remains deterministic for the demo. This preserves the Figma concept while keeping the app ready for a real AI API later.
