import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';

export default function MemoryScreen() {
  const { memories, loadMemories } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'preference', 'fact', 'context', 'personal'

  useEffect(() => {
    loadMemories();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMemories();
    setRefreshing(false);
  };

  const filteredMemories = filter === 'all'
    ? memories
    : memories.filter(m => m.memory_type === filter);

  const getMemoryIcon = (type: string) => {
    switch (type) {
      case 'preference':
        return 'heart';
      case 'fact':
        return 'bulb';
      case 'context':
        return 'document-text';
      case 'personal':
        return 'person';
      default:
        return 'information-circle';
    }
  };

  const getMemoryColor = (importance: number) => {
    if (importance >= 8) return '#00d4ff';
    if (importance >= 5) return '#0088ff';
    return '#666';
  };

  const renderMemory = ({ item }: any) => (
    <View style={styles.memoryCard}>
      <View style={styles.memoryHeader}>
        <View style={styles.memoryTitleRow}>
          <Ionicons
            name={getMemoryIcon(item.memory_type)}
            size={20}
            color={getMemoryColor(item.importance)}
          />
          <Text style={styles.memoryKey}>{item.key}</Text>
        </View>
        <View style={styles.importanceContainer}>
          {[...Array(item.importance)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.importanceDot,
                { backgroundColor: getMemoryColor(item.importance) },
              ]}
            />
          ))}
        </View>
      </View>
      <Text style={styles.memoryValue}>{item.value}</Text>
      <View style={styles.memoryFooter}>
        <Text style={styles.memoryType}>{item.memory_type}</Text>
        <Text style={styles.memoryDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Memory Bank</Text>
        <Text style={styles.subtitle}>
          {memories.length} memories stored • Self-learning active
        </Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {['all', 'preference', 'fact', 'context', 'personal'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              filter === type && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(type)}
          >
            <Text
              style={[
                styles.filterText,
                filter === type && styles.filterTextActive,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredMemories}
        renderItem={renderMemory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00d4ff"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="brain" size={60} color="#333" />
            <Text style={styles.emptyText}>No memories yet</Text>
            <Text style={styles.emptySubtext}>
              Start chatting with Arya to build memories!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: '#00d4ff',
    borderColor: '#00d4ff',
  },
  filterText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#000',
  },
  list: {
    padding: 16,
  },
  memoryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  memoryKey: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  importanceContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  importanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  memoryValue: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
  memoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memoryType: {
    fontSize: 12,
    color: '#00d4ff',
    fontWeight: '600',
  },
  memoryDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});