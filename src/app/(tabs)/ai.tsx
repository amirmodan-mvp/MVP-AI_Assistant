import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowUp,
  CalendarDays,
  Copy,
  FileText,
  ImagePlus,
  ListTodo,
  Mic,
  Paperclip,
  Sparkles,
  WandSparkles,
  X,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Orb } from '../../components/Orb';
import { ResponseCard } from '../../components/ResponseCard';
import { Colors } from '../../constants/theme';
import { useTasks } from '../../context/TaskContext';
import { createAIResponse } from '../../lib/assistant';
import type { Message, TaskAction, TaskDue } from '../../types/assistant';

type AttachedDocument = {
  uri: string;
  name: string;
  mimeType?: string;
};

const AI_MESSAGES_STORAGE_KEY = '@mvp-ai/messages';

export default function AIScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ prompt?: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [checkedList, setCheckedList] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedDocument, setAttachedDocument] =
    useState<AttachedDocument | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const promptHandled = useRef(false);
  const {
    tasks,
    addTask: addSharedTask,
    updateTask,
    toggleTask,
    removeTask,
  } = useTasks();

  /*
   * Load the saved conversation once when the screen mounts.
   */
  useEffect(() => {
    let mounted = true;

    const loadMessages = async () => {
      try {
        const stored = await AsyncStorage.getItem(
          AI_MESSAGES_STORAGE_KEY,
        );

        if (!mounted) return;

        if (stored) {
          try {
            const parsed = JSON.parse(stored);

            if (Array.isArray(parsed)) {
              setMessages(parsed);
            }
          } catch {
            // Ignore malformed saved data.
          }
        }
      } catch (error) {
        console.warn('Failed to load AI conversation:', error);
      } finally {
        if (mounted) {
          setIsLoaded(true);
        }
      }
    };

    loadMessages();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Save the conversation whenever messages change.
   *
   * isLoaded prevents the initial empty state from overwriting
   * an existing saved conversation before it has finished loading.
   */
  useEffect(() => {
    if (!isLoaded) return;

    const saveMessages = async () => {
      try {
        await AsyncStorage.setItem(
          AI_MESSAGES_STORAGE_KEY,
          JSON.stringify(messages),
        );
      } catch (error) {
        console.warn('Failed to save AI conversation:', error);
      }
    };

    saveMessages();
  }, [messages, isLoaded]);

  /*
   * Handle prompts passed into the AI tab through navigation.
   *
   * The ref prevents the same navigation prompt from being submitted
   * repeatedly if the screen re-renders.
   */
  useEffect(() => {
    if (!isLoaded) return;
    if (!params.prompt) return;
    if (promptHandled.current) return;

    promptHandled.current = true;
    ask(params.prompt);
  }, [params.prompt, isLoaded]);

  const addTask = (
    title: string,
    due: TaskDue = 'Tomorrow',
    time = '9:00 AM',
  ) => {
    addSharedTask({
      title,
      due,
      time,
      category: 'Work',
    });
  };

  const openTasks = () => {
    router.navigate('/(tabs)/tasks');
  };

  const executeTaskAction = (action: TaskAction) => {
    switch (action.type) {
      case 'toggle':
        toggleTask(action.taskId);
        break;

      case 'remove':
        removeTask(action.taskId);
        break;

      case 'update':
        updateTask(action.taskId, {
          title: action.title,
          due: action.due,
          time: action.time,
        });
        break;
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const ask = (
    value: string,
    imageUri?: string | null,
    document?: AttachedDocument | null,
  ) => {
    const text = value.trim();

    if ((!text && !imageUri && !document) || isThinking) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      text:
        text ||
        (imageUri
          ? 'Please describe this image.'
          : `Please summarize ${document?.name ?? 'this document'}`),
      ...(imageUri ? { imageUri } : {}),
      ...(document
        ? {
          documentUri: document.uri,
          documentName: document.name,
        }
        : {}),
    };

    setMessages(current => [...current, userMessage]);
    setDraft('');
    setAttachedImage(null);
    setAttachedDocument(null);
    setIsThinking(true);

    scrollToBottom();

    setTimeout(() => {
      const response = createAIResponse(
        text ||
        (imageUri
          ? 'Describe this image'
          : `Summarize ${document?.name ?? 'this document'}`),
        tasks,
      );

      if (response.taskAction) {
        executeTaskAction(response.taskAction);
      }

      setMessages(current => [
        ...current,
        {
          id: Date.now(),
          ...response,
        },
      ]);

      setIsThinking(false);
      scrollToBottom();
    }, 900);
  };

  const startNewChat = () => {
    if (messages.length === 0) return;

    Alert.alert(
      'Start a new chat?',
      'This will clear your current conversation.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'New Chat',
          style: 'destructive',
          onPress: () => {
            setMessages([]);
            setDraft('');
            setAttachedImage(null);
            setAttachedDocument(null);
            setCheckedList([]);
          },
        },
      ],
    );
  };

  const upload = async () => {
    if (isThinking) return;

    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: '*/*',
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      setAttachedDocument({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
      });

      // A document and photo are mutually exclusive attachments.
      setAttachedImage(null);

      scrollToBottom();
    }
  };

  const photo = async () => {
    if (isThinking) return;

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setAttachedImage(result.assets[0].uri);

      // A document and photo are mutually exclusive attachments.
      setAttachedDocument(null);

      scrollToBottom();
    }
  };

  const removeAttachment = () => {
    setAttachedImage(null);
    setAttachedDocument(null);
  };

  const showToast = (text: string) => {
    console.log(text);
  };

  const hasAttachment = Boolean(
    attachedImage || attachedDocument,
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <View style={styles.headingTop}>
            <Text style={styles.eyebrow}>
              A LITTLE HELP, WHENEVER YOU NEED IT
            </Text>

            {messages.length > 0 ? (
              <Pressable
                onPress={startNewChat}
                disabled={isThinking}
                style={styles.newChat}
              >
                <Text
                  style={[
                    styles.newChatText,
                    isThinking && styles.newChatTextDisabled,
                  ]}
                >
                  New Chat
                </Text>
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.h1}>
            Ask anything<Text style={styles.period}>.</Text>
          </Text>

          <Text style={styles.sub}>
            Your ideas, plans, and questions — all in one place.
          </Text>
        </View>

        {messages.length === 0 && !isThinking ? (
          <View style={styles.empty}>
            <View style={styles.emptyOrb}>
              <Orb />
            </View>

            <Text style={styles.emptyTitle}>What's on your mind?</Text>

            <Text style={styles.emptyText}>
              I'm here to help you find the next step, big or small.
            </Text>

            <View style={styles.suggestions}>
              <Suggestion
                icon={<CalendarDays size={18} color="#906BBF" />}
                label="Plan my day"
                onPress={() => ask('Plan my day')}
              />

              <Suggestion
                icon={<WandSparkles size={18} color="#906BBF" />}
                label="Help me make a decision"
                onPress={() =>
                  ask('Help me decide between two options')
                }
              />

              <Suggestion
                icon={<ListTodo size={18} color="#906BBF" />}
                label="Make a checklist"
                onPress={() =>
                  ask('Create a grocery checklist')
                }
              />
            </View>
          </View>
        ) : (
          <View style={styles.thread}>
            {messages.map(message => (
              <View
                key={message.id}
                style={[
                  styles.message,
                  message.role === 'user' && styles.userMessage,
                ]}
              >
                {message.role === 'assistant' ? (
                  <View style={styles.chatAvatar}>
                    <Sparkles size={15} color="#FFF" />
                  </View>
                ) : null}

                <View
                  style={[
                    message.role === 'user'
                      ? styles.userBubble
                      : styles.messageBody,
                  ]}
                >
                  {message.imageUri ? (
                    <Image
                      source={{ uri: message.imageUri }}
                      style={styles.messageImage}
                    />
                  ) : null}

                  {message.documentName ? (
                    <View style={styles.messageDocument}>
                      <View style={styles.documentIcon}>
                        <FileText size={17} color="#7958B5" />
                      </View>

                      <View style={styles.documentMessageInfo}>
                        <Text
                          style={styles.documentMessageName}
                          numberOfLines={2}
                        >
                          {message.documentName}
                        </Text>

                        <Text style={styles.documentMessageLabel}>
                          Document attached
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  <Text style={styles.messageText}>
                    {message.text}
                  </Text>

                  {message.card ? (
                    <ResponseCard
                      type={message.card}
                      taskTitle={message.taskTitle}
                      taskDue={message.taskDue}
                      taskTime={message.taskTime}
                      checkedList={checkedList}
                      setCheckedList={setCheckedList}
                      onAddTask={addTask}
                      onOpenTasks={openTasks}
                      onToast={showToast}
                    />
                  ) : null}

                  {message.role === 'assistant' ? (
                    <View style={styles.responseActions}>
                      <Pressable
                        style={styles.responseAction}
                        onPress={async () => {
                          await Clipboard.setStringAsync(
                            message.text,
                          );
                          showToast('Response copied');
                        }}
                      >
                        <Copy size={14} color="#A39BAB" />
                        <Text style={styles.responseActionText}>
                          Copy
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}

            {isThinking ? <ThinkingIndicator /> : null}
          </View>
        )}
      </ScrollView>

      <View style={styles.compose}>
        {attachedImage ? (
          <View style={styles.attachmentPreview}>
            <Image
              source={{ uri: attachedImage }}
              style={styles.attachmentImage}
            />

            <View style={styles.attachmentInfo}>
              <Text style={styles.attachmentTitle}>
                Photo attached
              </Text>

              <Text style={styles.attachmentSubtitle}>
                Add an instruction or send it as-is
              </Text>
            </View>

            <Pressable
              style={styles.removeAttachment}
              onPress={removeAttachment}
            >
              <X size={15} color="#716878" />
            </Pressable>
          </View>
        ) : null}

        {attachedDocument ? (
          <View style={styles.attachmentPreview}>
            <View style={styles.documentIcon}>
              <FileText size={19} color="#7958B5" />
            </View>

            <View style={styles.attachmentInfo}>
              <Text
                style={styles.attachmentTitle}
                numberOfLines={1}
              >
                {attachedDocument.name}
              </Text>

              <Text style={styles.attachmentSubtitle}>
                Add an instruction or send it as-is
              </Text>
            </View>

            <Pressable
              style={styles.removeAttachment}
              onPress={removeAttachment}
            >
              <X size={15} color="#716878" />
            </Pressable>
          </View>
        ) : null}

        <View
          style={[
            styles.composeBox,
            isThinking && styles.composeBoxDisabled,
          ]}
        >
          <Pressable
            onPress={upload}
            disabled={isThinking}
          >
            <Paperclip
              size={19}
              color={isThinking ? '#C7C0CB' : '#9B90A5'}
            />
          </Pressable>

          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={
              attachedImage
                ? 'What should I do with this image?'
                : attachedDocument
                  ? 'What should I do with this document?'
                  : 'Ask me anything...'
            }
            placeholderTextColor="#AAA2AD"
            style={styles.input}
            multiline
            textAlignVertical="center"
            onSubmitEditing={() =>
              ask(draft, attachedImage, attachedDocument)
            }
            returnKeyType="send"
            editable={!isThinking}
          />

          <Pressable
            onPress={() =>
              console.log(
                'Native voice input can be connected here',
              )
            }
            disabled={isThinking}
          >
            <Mic
              size={19}
              color={isThinking ? '#C7C0CB' : '#9B90A5'}
            />
          </Pressable>

          <Pressable
            style={[
              styles.send,
              isThinking && styles.sendDisabled,
            ]}
            onPress={() =>
              ask(draft, attachedImage, attachedDocument)
            }
            disabled={
              isThinking ||
              (!draft.trim() && !hasAttachment)
            }
          >
            <ArrowUp size={19} color="#FFF" />
          </Pressable>
        </View>

        <View style={styles.hint}>
          <Pressable
            onPress={photo}
            style={styles.photo}
            disabled={isThinking}
          >
            <ImagePlus
              size={13}
              color={isThinking ? '#C7C0CB' : '#9B87B2'}
            />

            <Text
              style={isThinking ? styles.disabledHint : undefined}
            >
              Add photo
            </Text>
          </Pressable>

          <Text>Thoughtfully here for you</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function ThinkingIndicator() {
  const animations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const loops = animations.map((animation, index) => {
      const delay = index * 160;

      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),

          Animated.timing(animation, {
            toValue: 1,
            duration: 350,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(animation, {
            toValue: 0,
            duration: 350,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.delay(160 * (2 - index)),
        ]),
      );
    });

    loops.forEach(loop => loop.start());

    return () => {
      loops.forEach(loop => loop.stop());
    };
  }, [animations]);

  return (
    <View style={styles.message}>
      <View style={styles.chatAvatar}>
        <Sparkles size={15} color="#FFF" />
      </View>

      <View style={styles.thinkingBubble}>
        <View style={styles.thinkingDots}>
          {animations.map((animation, index) => {
            const translateY = animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -3],
            });

            const scale = animation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.35],
            });

            const opacity = animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.45, 1],
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    opacity,
                    transform: [
                      { translateY },
                      { scale },
                    ],
                  },
                ]}
              />
            );
          })}
        </View>

        <Text style={styles.thinkingText}>Thinking...</Text>
      </View>
    </View>
  );
}

function Suggestion({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.suggestion} onPress={onPress}>
      {icon}
      <Text style={styles.suggestionText}>{label}</Text>
      <ArrowUp size={15} color="#B0A1BE" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    padding: 24,
    paddingBottom: 25,
  },

  heading: {
    marginTop: 15,
    marginBottom: 23,
  },

  headingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  eyebrow: {
    color: '#9A89B2',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    flexShrink: 1,
  },

  newChat: {
    paddingVertical: 4,
    paddingHorizontal: 7,
    marginLeft: 10,
  },

  newChatText: {
    color: '#7958B5',
    fontSize: 10,
    fontWeight: '700',
  },

  newChatTextDisabled: {
    color: '#C7C0CB',
  },

  h1: {
    marginTop: 10,
    fontSize: 35,
    lineHeight: 41,
    fontWeight: '700',
    color: '#2B2733',
  },

  period: {
    color: '#8D67D9',
  },

  sub: {
    color: '#92909A',
    fontSize: 12.5,
    marginTop: 8,
  },

  empty: {
    alignItems: 'center',
    paddingTop: 35,
  },

  emptyOrb: {
    width: 114,
    height: 114,
    borderRadius: 34,
    backgroundColor: '#F2ECF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#38313F',
  },

  emptyText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#99919F',
    textAlign: 'center',
    maxWidth: 220,
    marginVertical: 7,
  },

  suggestions: {
    width: '100%',
    gap: 9,
    marginTop: 20,
  },

  suggestion: {
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEAF0',
    borderRadius: 13,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  suggestionText: {
    flex: 1,
    color: '#514A56',
    fontSize: 11,
    fontWeight: '700',
  },

  thread: {
    gap: 21,
    paddingBottom: 10,
  },

  message: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  messageBody: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },

  userMessage: {
    justifyContent: 'flex-end',
  },

  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '68%',
    backgroundColor: '#EDE6F6',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  chatAvatar: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: '#7958B5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  messageText: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 18,
    color: '#534E59',
  },

  messageImage: {
    width: 190,
    height: 145,
    borderRadius: 11,
    marginBottom: 8,
    backgroundColor: '#E8E2EA',
  },

  messageDocument: {
    width: 190,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 9,
    borderRadius: 11,
    backgroundColor: '#F5F0F8',
    marginBottom: 8,
  },

  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EAE1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  documentMessageInfo: {
    flex: 1,
    marginLeft: 9,
  },

  documentMessageName: {
    color: '#4B4352',
    fontSize: 10.5,
    fontWeight: '700',
  },

  documentMessageLabel: {
    color: '#9A909F',
    fontSize: 9,
    marginTop: 3,
  },

  thinkingBubble: {
    minHeight: 42,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F4F0F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  thinkingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#8968A9',
  },

  thinkingText: {
    color: '#8F8795',
    fontSize: 10.5,
    fontWeight: '600',
  },

  responseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },

  responseAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  responseActionText: {
    color: '#A39BAB',
    fontSize: 10,
  },

  compose: {
    paddingHorizontal: 17,
    paddingTop: 9,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: '#EFEBED',
  },

  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F3F9',
    borderWidth: 1,
    borderColor: '#E8DFEC',
    borderRadius: 13,
    padding: 7,
    marginBottom: 8,
  },

  attachmentImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E7E0EA',
  },

  attachmentInfo: {
    flex: 1,
    marginLeft: 10,
  },

  attachmentTitle: {
    color: '#4D4653',
    fontSize: 11,
    fontWeight: '700',
  },

  attachmentSubtitle: {
    color: '#9B929F',
    fontSize: 9.5,
    marginTop: 3,
  },

  removeAttachment: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#EDE7F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 7,
  },

  composeBox: {
    borderWidth: 1,
    borderColor: '#E8E1EC',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 6,
    paddingLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  composeBoxDisabled: {
    backgroundColor: '#FAF9FA',
  },

  input: {
    flex: 1,
    minWidth: 0,
    maxHeight: 100,
    fontSize: 12,
    color: '#332C3C',
  },

  send: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#7854B4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendDisabled: {
    backgroundColor: '#C9BED5',
  },

  hint: {
    marginTop: 8,
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#B8B1BC',
  },

  photo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  disabledHint: {
    color: '#C7C0CB',
  },
});

function executeTaskAction(taskAction: any) {
  throw new Error('Function not implemented.');
}
