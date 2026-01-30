import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import api from '../lib/api';

interface Barber {
  _id: string;
  name: string;
  shopName?: string;
  rating: number;
  totalReviews: number;
  skills: string[];
}

export default function BarbersScreen() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      const response = await api.get('/barbers/all');
      setBarbers(response.data.data.barbers);
    } catch (error) {
      console.error('Error fetching barbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBarber = ({ item }: { item: Barber }) => (
    <TouchableOpacity style={styles.barberCard}>
      <View style={styles.barberHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.barberInfo}>
          <Text style={styles.barberName}>{item.name}</Text>
          {item.shopName && <Text style={styles.shopName}>{item.shopName}</Text>}
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({item.totalReviews} reviews)</Text>
          </View>
        </View>
      </View>
      {item.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {item.skills.slice(0, 3).map((skill, idx) => (
            <View key={idx} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Your Barber</Text>
      </View>
      {loading ? (
        <View style={styles.center}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={barbers}
          renderItem={renderBarber}
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
  list: {
    padding: 16,
  },
  barberCard: {
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
  barberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  barberInfo: {
    flex: 1,
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
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginRight: 8,
  },
  reviews: {
    fontSize: 14,
    color: '#64748b',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    color: '#0ea5e9',
    fontWeight: '500',
  },
});
