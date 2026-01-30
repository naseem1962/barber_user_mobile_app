import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function HomeScreen() {
  const { user } = useAuthStore();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {user?.name}</Text>
        <Text style={styles.subtitle}>Find your perfect barber</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user?.loyaltyPoints || 0}</Text>
          <Text style={styles.statLabel}>Loyalty Points</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user?.loyaltyLevel || 'Bronze'}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>🔍</Text>
          <Text style={styles.actionText}>Find Barbers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>🤖</Text>
          <Text style={styles.actionText}>AI Recommendations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>📱</Text>
          <Text style={styles.actionText}>Try Style</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Messages</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
  },
});
