import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

import { ApiError, login, register, scanImage, getScanHistory, type ScanResult } from './src/api/client';

type Screen =
  | 'welcome'
  | 'auth'
  | 'home'
  | 'capture'
  | 'result'
  | 'history'
  | 'education'
  | 'settings';

const DISCLAIMER =
  'SkinSpotCheck is not a medical diagnosis. See a doctor or dermatologist for concerning, changing, painful, bleeding, or unusual spots.';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [token, setToken] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);

  useEffect(() => {
    SecureStore.getItemAsync('skinspotcheck_token').then((savedToken) => {
      if (savedToken) {
        setToken(savedToken);
        setScreen('home');
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      token,
      setToken: async (nextToken: string | null) => {
        setToken(nextToken);
        if (nextToken) {
          await SecureStore.setItemAsync('skinspotcheck_token', nextToken);
        } else {
          await SecureStore.deleteItemAsync('skinspotcheck_token');
        }
      },
    }),
    [token],
  );

  const loadHistory = async () => {
    if (!token) return;
    try {
      setHistory(await getScanHistory(token));
      setScreen('history');
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <SafeAreaView style={styles.shell}>
      <StatusBar style="dark" />
      {screen !== 'welcome' && (
        <View style={styles.topBar}>
          <Pressable style={styles.iconButton} onPress={() => setScreen(token ? 'home' : 'welcome')}>
            <Ionicons name="chevron-back" size={22} color="#16302b" />
          </Pressable>
          <Text style={styles.brand}>SkinSpotCheck</Text>
          <Pressable style={styles.iconButton} onPress={() => setScreen('settings')}>
            <Ionicons name="settings-outline" size={21} color="#16302b" />
          </Pressable>
        </View>
      )}
      {screen === 'welcome' && <WelcomeScreen onContinue={() => setScreen('auth')} />}
      {screen === 'auth' && <AuthScreen auth={value} onDone={() => setScreen('home')} />}
      {screen === 'home' && (
        <HomeScreen
          onCapture={() => setScreen('capture')}
          onHistory={loadHistory}
          onEducation={() => setScreen('education')}
        />
      )}
      {screen === 'capture' && token && (
        <CaptureScreen
          token={token}
          onResult={(result) => {
            setLatestResult(result);
            setScreen('result');
          }}
        />
      )}
      {screen === 'result' && latestResult && <ResultScreen result={latestResult} onHistory={loadHistory} />}
      {screen === 'history' && <HistoryScreen history={history} />}
      {screen === 'education' && <EducationScreen />}
      {screen === 'settings' && (
        <SettingsScreen
          isSignedIn={Boolean(token)}
          onSignOut={async () => {
            await value.setToken(null);
            setLatestResult(null);
            setHistory([]);
            setScreen('welcome');
          }}
        />
      )}
    </SafeAreaView>
  );
}

function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heroMark}>
        <Ionicons name="scan-circle-outline" size={72} color="#f6f7f2" />
      </View>
      <Text style={styles.title}>SkinSpotCheck</Text>
      <Text style={styles.subtitle}>Capture or upload a skin spot photo for a rough risk-screening result.</Text>
      <Notice text={DISCLAIMER} />
      <PrimaryButton label="I understand" icon="checkmark-circle-outline" onPress={onContinue} />
    </ScrollView>
  );
}

function AuthScreen({
  auth,
  onDone,
}: {
  auth: { setToken: (token: string | null) => Promise<void> };
  onDone: () => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const token =
        mode === 'register'
          ? await register(email.trim(), password)
          : await login(email.trim(), password);
      await auth.setToken(token);
      onDone();
    } catch (error) {
      showApiError(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{mode === 'login' ? 'Sign in' : 'Create account'}</Text>
      <View style={styles.segment}>
        <SegmentButton label="Login" active={mode === 'login'} onPress={() => setMode('login')} />
        <SegmentButton label="Register" active={mode === 'register'} onPress={() => setMode('register')} />
      </View>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
      />
      <PrimaryButton
        label={busy ? 'Please wait' : mode === 'login' ? 'Sign in' : 'Register'}
        icon="log-in-outline"
        onPress={submit}
        disabled={busy}
      />
    </ScrollView>
  );
}

function HomeScreen({
  onCapture,
  onHistory,
  onEducation,
}: {
  onCapture: () => void;
  onHistory: () => void;
  onEducation: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Dashboard</Text>
      <Notice text="This app screens for rough concern levels only. It is not a diagnosis." />
      <ActionRow icon="camera-outline" label="Take or upload photo" onPress={onCapture} />
      <ActionRow icon="time-outline" label="Scan history" onPress={onHistory} />
      <ActionRow icon="book-outline" label="ABCDE warning signs" onPress={onEducation} />
    </ScrollView>
  );
}

function CaptureScreen({ token, onResult }: { token: string; onResult: (result: ScanResult) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (source: 'camera' | 'library') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Photo access is required to scan a spot image.');
      return;
    }
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.85, mediaTypes: ImagePicker.MediaTypeOptions.Images })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.85, mediaTypes: ImagePicker.MediaTypeOptions.Images });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setPreview(asset.uri);
    setBusy(true);
    try {
      onResult(await scanImage(token, asset.uri, asset.fileName ?? 'skin-spot.jpg', asset.mimeType ?? 'image/jpeg'));
    } catch (error) {
      showApiError(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Spot photo</Text>
      <Notice text="Use a clear, well-lit photo. Do not delay medical care while using this app." />
      {preview ? <Image source={{ uri: preview }} style={styles.preview} /> : <View style={styles.previewEmpty} />}
      {busy ? <ActivityIndicator size="large" color="#0f766e" /> : null}
      <PrimaryButton label="Take photo" icon="camera-outline" onPress={() => pick('camera')} disabled={busy} />
      <SecondaryButton label="Upload image" icon="image-outline" onPress={() => pick('library')} disabled={busy} />
    </ScrollView>
  );
}

function ResultScreen({ result, onHistory }: { result: ScanResult; onHistory: () => void }) {
  const tone = result.result === 'High concern' ? '#b42318' : result.result === 'Medium concern' ? '#a15c07' : '#0f766e';
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Scan result</Text>
      <View style={[styles.resultPanel, { borderColor: tone }]}>
        <Text style={[styles.resultText, { color: tone }]}>{result.result}</Text>
        {result.confidence !== null && <Text style={styles.body}>Confidence: {Math.round(result.confidence * 100)}%</Text>}
        <Text style={styles.body}>{result.disclaimer}</Text>
      </View>
      <Notice text={DISCLAIMER} />
      <PrimaryButton label="View history" icon="time-outline" onPress={onHistory} />
    </ScrollView>
  );
}

function HistoryScreen({ history }: { history: ScanResult[] }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Scan history</Text>
      {history.length === 0 ? <Text style={styles.body}>No scans yet.</Text> : null}
      {history.map((scan) => (
        <View key={scan.id} style={styles.listItem}>
          <Text style={styles.listTitle}>{scan.result}</Text>
          <Text style={styles.body}>{new Date(scan.created_at).toLocaleString()}</Text>
          <Text style={styles.small}>{scan.disclaimer}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function EducationScreen() {
  const items = [
    ['A', 'Asymmetry'],
    ['B', 'Border that is irregular'],
    ['C', 'Color variation'],
    ['D', 'Diameter or dark appearance'],
    ['E', 'Evolving, changing, painful, bleeding, or unusual'],
  ];
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>ABCDE signs</Text>
      {items.map(([letter, text]) => (
        <View key={letter} style={styles.listItem}>
          <Text style={styles.listTitle}>{letter}</Text>
          <Text style={styles.body}>{text}</Text>
        </View>
      ))}
      <Notice text={DISCLAIMER} />
    </ScrollView>
  );
}

function SettingsScreen({ isSignedIn, onSignOut }: { isSignedIn: boolean; onSignOut: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Settings</Text>
      <Notice text="Secrets are not stored in the app source. API URLs are configured through Expo public environment values." />
      {isSignedIn ? <SecondaryButton label="Sign out" icon="log-out-outline" onPress={onSignOut} /> : null}
    </ScrollView>
  );
}

function PrimaryButton({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable style={[styles.primaryButton, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
      <Ionicons name={icon} size={20} color="#ffffff" />
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton(props: Parameters<typeof PrimaryButton>[0]) {
  return (
    <Pressable style={[styles.secondaryButton, props.disabled && styles.disabled]} onPress={props.onPress} disabled={props.disabled}>
      <Ionicons name={props.icon} size={20} color="#16302b" />
      <Text style={styles.secondaryText}>{props.label}</Text>
    </Pressable>
  );
}

function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.segmentButton, active && styles.segmentActive]} onPress={onPress}>
      <Text style={active ? styles.segmentActiveText : styles.segmentText}>{label}</Text>
    </Pressable>
  );
}

function ActionRow({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.actionRow} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#0f766e" />
      <Text style={styles.actionLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#55706b" />
    </Pressable>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <View style={styles.notice}>
      <Ionicons name="alert-circle-outline" size={20} color="#7a3e00" />
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

function showApiError(error: unknown) {
  const message = error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
  Alert.alert('Request failed', message);
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: '#f7faf8' },
  topBar: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#d9e3df',
  },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 18, fontWeight: '700', color: '#16302b' },
  content: { padding: 20, gap: 16 },
  heroMark: {
    alignSelf: 'center',
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#0f766e',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  title: { fontSize: 34, fontWeight: '800', color: '#16302b', textAlign: 'center' },
  subtitle: { fontSize: 17, color: '#405955', textAlign: 'center', lineHeight: 24 },
  heading: { fontSize: 28, fontWeight: '800', color: '#16302b' },
  body: { fontSize: 16, color: '#405955', lineHeight: 23 },
  small: { fontSize: 13, color: '#667b77', lineHeight: 19 },
  notice: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#fff4df',
    borderWidth: 1,
    borderColor: '#f3c782',
  },
  noticeText: { flex: 1, fontSize: 14, color: '#6f3b05', lineHeight: 20 },
  primaryButton: {
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: '#0f766e',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b8c9c4',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  secondaryText: { color: '#16302b', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.55 },
  input: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b8c9c4',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    fontSize: 16,
  },
  segment: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, borderColor: '#b8c9c4', overflow: 'hidden' },
  segmentButton: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: '#dcefeb' },
  segmentText: { color: '#405955', fontWeight: '700' },
  segmentActiveText: { color: '#0f766e', fontWeight: '800' },
  actionRow: {
    minHeight: 64,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#d9e3df',
  },
  actionLabel: { flex: 1, fontSize: 17, fontWeight: '700', color: '#16302b' },
  preview: { width: '100%', aspectRatio: 1, borderRadius: 8, backgroundColor: '#d9e3df' },
  previewEmpty: { width: '100%', aspectRatio: 1, borderRadius: 8, backgroundColor: '#d9e3df' },
  resultPanel: { padding: 18, borderRadius: 8, borderWidth: 2, backgroundColor: '#ffffff', gap: 8 },
  resultText: { fontSize: 30, fontWeight: '800' },
  listItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d9e3df',
    gap: 6,
  },
  listTitle: { fontSize: 18, fontWeight: '800', color: '#16302b' },
});
