import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface ChatListItem {
  _id: string;
  participants: { user?: { _id: string; name: string }; barber?: { _id: string; name: string; shopName?: string } };
  lastMessage?: { content: string; createdAt: string };
  updatedAt: string;
}

interface Message {
  sender: string;
  senderType: 'user' | 'barber' | 'admin';
  content: string;
  createdAt: string;
}

type ChatRouteParams = { barberId?: string };

export default function ChatScreen() {
  const route = useRoute<RouteProp<{ params: ChatRouteParams }, 'params'>>();
  const barberIdParam = route.params?.barberId;
  const { user } = useAuthStore();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatListItem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const barberIdHandled = useRef(false);

  useEffect(() => {
    api
      .get('/chat/user/chats')
      .then((res) => setChats(res.data.data?.chats || []))
      .catch(() => setChats([]))
      .finally(() => setLoadingChats(false));
  }, []);

  useEffect(() => {
    if (!barberIdParam || barberIdHandled.current || loadingChats) return;
    barberIdHandled.current = true;
    api
      .get('/chat', { params: { barberId: barberIdParam } })
      .then((res) => {
        if (!res.data.success || !res.data.data?.chat) return;
        const created = res.data.data.chat;
        return api.get('/chat/user/chats').then((listRes: any) => {
          const list = listRes.data?.data?.chats || listRes.data?.chats || [];
          setChats(list);
          const found = list.find((c: ChatListItem) => c._id === created._id);
          setSelectedChat(found || created);
        });
      })
      .catch(() => {})
      .finally(() => { barberIdHandled.current = false; });
  }, [barberIdParam, loadingChats]);

  useEffect(() => {
    if (!selectedChat?._id) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    api
      .get('/chat/' + selectedChat._id + '/messages')
      .then((res) => setMessages(res.data.data?.chat?.messages || []))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [selectedChat?._id]);

  const sendMessage = () => {
    const content = input.trim();
    if (!content || !selectedChat?._id || sending) return;
    setSending(true);
    api
      .post('/chat/message', { chatId: selectedChat._id, content })
      .then(() => {
        setInput('');
        setMessages((prev) => [...prev, { sender: user?.id ?? '', senderType: 'user', content, createdAt: new Date().toISOString() }]);
        api.get('/chat/user/chats').then((res) => setChats(res.data.data?.chats || []));
      })
      .finally(() => setSending(false));
  };

  const barberName = (chat: ChatListItem) => chat.participants?.barber?.name ?? 'Barber';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.sidebar}>
          {loadingChats ? (
            <Text style={styles.muted}>Loading...</Text>
          ) : chats.length === 0 ? (
            <Text style={styles.muted}>No conversations yet.</Text>
          ) : (
            chats.map((chat) => (
              <TouchableOpacity
                key={chat._id}
                style={[styles.chatItem, selectedChat?._id === chat._id && styles.chatItemSelected]}
                onPress={() => setSelectedChat(chat)}
              >
                <Text style={styles.chatName}>{barberName(chat)}</Text>
                <Text style={styles.chatPreview} numberOfLines={1}>{chat.lastMessage?.content || 'No messages'}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
        <View style={styles.main}>
          {!selectedChat ? (
            <View style={styles.placeholder}>
              <Text style={styles.muted}>Select a conversation.</Text>
            </View>
          ) : (
            <>
              <View style={styles.conversationHeader}>
                <Text style={styles.conversationTitle}>{barberName(selectedChat)}</Text>
              </View>
              {loadingMessages ? (
                <Text style={styles.muted}>Loading...</Text>
              ) : (
                <FlatList
                  data={messages}
                  keyExtractor={(_, i) => i.toString()}
                  renderItem={({ item }) => (
                    <View style={[styles.messageBubble, item.senderType === 'user' ? styles.messageBubbleUser : styles.messageBubbleOther]}>
                      <Text style={item.senderType === 'user' ? styles.messageTextUser : styles.messageTextOther}>{item.content}</Text>
                      <Text style={item.senderType === 'user' ? styles.messageTimeUser : styles.messageTimeOther}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </Text>
                    </View>
                  )}
                  contentContainerStyle={styles.messagesList}
                />
              )}
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inputRow}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Type a message..."
                  style={styles.input}
                  onSubmitEditing={sendMessage}
                />
                <TouchableOpacity
                  style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
                  onPress={sendMessage}
                  disabled={!input.trim() || sending}
                >
                  <Text style={styles.sendBtnText}>Send</Text>
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  body: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 120, borderRightWidth: 1, borderRightColor: '#e2e8f0', padding: 8 },
  chatItem: { padding: 12, borderRadius: 8, marginBottom: 4 },
  chatItemSelected: { backgroundColor: '#f0f9ff' },
  chatName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  chatPreview: { fontSize: 12, color: '#64748b', marginTop: 2 },
  main: { flex: 1 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  conversationHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  conversationTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  messagesList: { padding: 16, flexGrow: 1 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 12, marginBottom: 8 },
  messageBubbleUser: { alignSelf: 'flex-end', backgroundColor: '#0ea5e9' },
  messageBubbleOther: { alignSelf: 'flex-start', backgroundColor: '#e2e8f0' },
  messageTextUser: { color: '#fff', fontSize: 14 },
  messageTextOther: { color: '#0f172a', fontSize: 14 },
  messageTimeUser: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4 },
  messageTimeOther: { color: '#64748b', fontSize: 11, marginTop: 4 },
  inputRow: { flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#fff' },
  input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  sendBtn: { backgroundColor: '#0ea5e9', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  muted: { fontSize: 14, color: '#64748b' },
});
