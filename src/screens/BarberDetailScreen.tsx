import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

type ParamList = { BarberDetail: { barberId: string } };

interface Barber {
  _id: string;
  name: string;
  shopName?: string;
  shopAddress?: string;
  rating: number;
  totalReviews: number;
  skills: string[];
  services: Array<{ name: string; price: number; duration: number }>;
}

interface Slot {
  time: string;
  display: string;
}

const DAYS = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return d;
});

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function BarberDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, 'BarberDetail'>>();
  const barberId = route.params?.barberId;
  const { isAuthenticated } = useAuthStore();

  const [barber, setBarber] = useState<Barber | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingBarber, setLoadingBarber] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [selectedService, setSelectedService] = useState<Barber['services'][0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [notes, setNotes] = useState('');
  const [bookSuccess, setBookSuccess] = useState(false);

  useEffect(() => {
    if (!barberId) return;
    api
      .get('/barbers/' + barberId)
      .then((res) => {
        if (res.data.success) setBarber(res.data.data.barber);
        else setBarber(null);
      })
      .catch(() => setBarber(null))
      .finally(() => setLoadingBarber(false));
  }, [barberId]);

  useEffect(() => {
    if (!barberId || !selectedDate) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    api
      .get('/appointments/availability', { params: { barberId, date: formatDate(selectedDate) } })
      .then((res) => setSlots(res.data.data?.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [barberId, selectedDate]);

  const handleBook = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign in', 'Sign in to book an appointment.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign in', onPress: () => navigation.navigate('Login' as never) },
      ]);
      return;
    }
    if (!selectedService || !selectedSlot || !barber) {
      Alert.alert('Error', 'Please select service, date and time.');
      return;
    }
    setBooking(true);
    api
      .post('/appointments', {
        barberId: barber._id,
        service: {
          name: selectedService.name,
          duration: selectedService.duration,
          price: selectedService.price,
        },
        appointmentDate: new Date(selectedSlot.time).toISOString(),
        notes: notes.trim() || undefined,
      })
      .then(() => {
        setBookSuccess(true);
      })
      .catch(() => Alert.alert('Error', 'Booking failed.'))
      .finally(() => setBooking(false));
  };

  if (loadingBarber) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }
  if (!barber) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Barber not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
          <Text style={styles.linkText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (bookSuccess) {
    return (
      <View style={styles.center}>
        <Text style={styles.successTitle}>Booking confirmed</Text>
        <Text style={styles.muted}>
          {selectedDate?.toLocaleDateString()} at {selectedSlot?.display}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Main' as never)} style={styles.button}>
          <Text style={styles.buttonText}>View my appointments</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{barber.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{barber.name}</Text>
        {barber.shopName && <Text style={styles.shop}>{barber.shopName}</Text>}
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>★ {(barber.rating || 0).toFixed(1)}</Text>
          <Text style={styles.reviews}>({barber.totalReviews ?? 0} reviews)</Text>
        </View>
        {isAuthenticated && (
          <TouchableOpacity
            style={styles.messageBtn}
            onPress={() => navigation.navigate('Main' as never, { screen: 'Chat', params: { barberId: barber._id } } as never)}
          >
            <Text style={styles.messageBtnText}>Message barber</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>Services</Text>
      {barber.services?.length === 0 ? (
        <Text style={styles.muted}>No services listed.</Text>
      ) : (
        barber.services?.map((svc, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.serviceCard, selectedService?.name === svc.name && styles.serviceCardSelected]}
            onPress={() => setSelectedService(svc)}
          >
            <Text style={styles.serviceName}>{svc.name}</Text>
            <Text style={styles.serviceMeta}>{svc.duration} min · ${svc.price}</Text>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.sectionTitle}>Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
        {DAYS.map((d) => {
          const isSelected = selectedDate && formatDate(d) === formatDate(selectedDate);
          return (
            <TouchableOpacity
              key={d.toISOString()}
              style={[styles.dateChip, isSelected && styles.dateChipSelected]}
              onPress={() => setSelectedDate(d)}
            >
              <Text style={[styles.dateChipText, isSelected && styles.dateChipTextSelected]}>
                {d.toLocaleDateString('en-US', { weekday: 'short' })} {d.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionTitle}>Time</Text>
      {loadingSlots ? (
        <ActivityIndicator size="small" color="#0ea5e9" />
      ) : !selectedDate ? (
        <Text style={styles.muted}>Pick a date first.</Text>
      ) : slots.length === 0 ? (
        <Text style={styles.muted}>No slots available.</Text>
      ) : (
        <View style={styles.slotRow}>
          {slots.map((slot) => {
            const isSelected = selectedSlot?.time === slot.time;
            return (
              <TouchableOpacity
                key={slot.time}
                style={[styles.slotChip, isSelected && styles.slotChipSelected]}
                onPress={() => setSelectedSlot(slot)}
              >
                <Text style={[styles.slotChipText, isSelected && styles.slotChipTextSelected]}>{slot.display}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={styles.sectionTitle}>Notes (optional)</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Special requests..."
        style={styles.input}
        multiline
      />

      <TouchableOpacity
        style={[styles.button, (!selectedService || !selectedSlot || booking) && styles.buttonDisabled]}
        onPress={handleBook}
        disabled={!selectedService || !selectedSlot || booking}
      >
        {booking ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isAuthenticated ? 'Confirm booking' : 'Sign in to book'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 40 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backBtnText: { fontSize: 16, fontWeight: '600', color: '#0ea5e9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#0ea5e9', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  shop: { fontSize: 14, color: '#64748b' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rating: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginRight: 8 },
  reviews: { fontSize: 14, color: '#64748b' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 12 },
  serviceCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 2, borderColor: '#e2e8f0' },
  serviceCardSelected: { borderColor: '#0ea5e9', backgroundColor: '#f0f9ff' },
  serviceName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  serviceMeta: { fontSize: 14, color: '#64748b', marginTop: 4 },
  dateRow: { marginBottom: 16 },
  dateChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#e2e8f0', marginRight: 8 },
  dateChipSelected: { backgroundColor: '#0ea5e9' },
  dateChipText: { fontSize: 14, fontWeight: '500', color: '#0f172a' },
  dateChipTextSelected: { color: '#fff' },
  slotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: '#e2e8f0' },
  slotChipSelected: { backgroundColor: '#0ea5e9' },
  slotChipText: { fontSize: 14, fontWeight: '500', color: '#0f172a' },
  slotChipTextSelected: { color: '#fff' },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', minHeight: 60, marginBottom: 16 },
  button: { backgroundColor: '#0ea5e9', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  muted: { fontSize: 14, color: '#64748b', marginBottom: 8 },
  successTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  link: { marginTop: 16 },
  linkText: { color: '#0ea5e9', fontWeight: '600' },
  messageBtn: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, borderColor: '#0ea5e9' },
  messageBtnText: { color: '#0ea5e9', fontWeight: '600', fontSize: 14 },
});
