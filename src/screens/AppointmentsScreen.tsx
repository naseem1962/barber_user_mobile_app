import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import api from '../lib/api';

interface Appointment {
  _id: string;
  barber: {
    name: string;
    shopName?: string;
  };
  service: {
    name: string;
    price: number;
  };
  appointmentDate: string;
  status: string;
}

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/user');
      setAppointments(response.data.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <Text style={styles.barberName}>{item.barber.name}</Text>
      {item.barber.shopName && <Text style={styles.shopName}>{item.barber.shopName}</Text>}
      <Text style={styles.service}>{item.service.name} - ${item.service.price}</Text>
      <Text style={styles.date}>
        {new Date(item.appointmentDate).toLocaleString()}
      </Text>
      <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { backgroundColor: '#dcfce7' };
      case 'confirmed':
        return { backgroundColor: '#dbeafe' };
      default:
        return { backgroundColor: '#fef3c7' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Appointments</Text>
      </View>
      {loading ? (
        <View style={styles.center}>
          <Text>Loading...</Text>
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No appointments yet</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
  },
  list: {
    padding: 16,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  barberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  service: {
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
    textTransform: 'capitalize',
  },
});
