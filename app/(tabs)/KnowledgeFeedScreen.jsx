import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants/colors';

const CATEGORY_FILTERS = ['All', 'Pest Alert', 'Tip', 'Weather', 'Success Story', 'Market'];

const CATEGORY_META = {
  'Pest Alert': { color: COLORS.danger, bg: '#FFEBEE', emoji: '🔴' },
  Tip: { color: COLORS.primary, bg: '#E8F5E9', emoji: '🟢' },
  Weather: { color: '#1976D2', bg: '#E3F2FD', emoji: '🔵' },
  'Success Story': { color: '#F9A825', bg: '#FFFDE7', emoji: '⭐' },
  Market: { color: COLORS.warning, bg: '#FFF8E1', emoji: '🟡' },
};

const INITIAL_POSTS = [
  {
    id: '1',
    farmer: 'Ramesh Patil',
    avatar: '👨‍🌾',
    location: 'Nashik',
    category: 'Pest Alert',
    time: '2 hours ago',
    title: 'Whitefly outbreak spreading in Nashik district',
    body:
      'Noticed heavy whitefly infestation on my tomato crop. Neem oil spray helped control 60% within 3 days. Alert all nearby farmers!',
    likes: 34,
    comments: 12,
    hasImage: true,
  },
  {
    id: '2',
    farmer: 'Sunita Deshmukh',
    avatar: '👩‍🌾',
    location: 'Pune',
    category: 'Tip',
    time: '5 hours ago',
    title: 'Best time to spray pesticide for maximum effect',
    body:
      'Always spray early morning before 8am or after 6pm. Avoid midday spraying — UV rays reduce effectiveness by 40%.',
    likes: 89,
    comments: 28,
    hasImage: false,
  },
  {
    id: '3',
    farmer: 'Vijay More',
    avatar: '👨‍🌾',
    location: 'Aurangabad',
    category: 'Success Story',
    time: '1 day ago',
    title: 'Saved 80% of cotton crop using Pestify recommendations',
    body:
      'Used the tiered treatment plan from Pestify. Started with neem oil, moved to bio spray. Saved ₹45,000 worth of cotton this season!',
    likes: 156,
    comments: 45,
    hasImage: true,
  },
  {
    id: '4',
    farmer: 'Anita Kulkarni',
    avatar: '👩‍🌾',
    location: 'Solapur',
    category: 'Weather',
    time: '3 hours ago',
    title: 'Rain expected next week — protect your crops now',
    body:
      'IMD forecast shows heavy rain in Solapur next week. Apply fungicide now before rainfall to prevent fungal outbreak.',
    likes: 67,
    comments: 19,
    hasImage: false,
  },
  {
    id: '5',
    farmer: 'Manoj Shinde',
    avatar: '👨‍🌾',
    location: 'Kolhapur',
    category: 'Market',
    time: '2 days ago',
    title: 'Onion prices rising — good time to harvest',
    body:
      'Onion prices at ₹2,800/quintal in Kolhapur APMC today. Expected to rise further. Plan your harvest accordingly.',
    likes: 203,
    comments: 67,
    hasImage: false,
  },
  {
    id: '6',
    farmer: 'Priya Jadhav',
    avatar: '👩‍🌾',
    location: 'Nagpur',
    category: 'Tip',
    time: '6 hours ago',
    title: 'Intercropping marigold reduces pest attack naturally',
    body:
      'Plant marigold between tomato rows. Repels whitefly and aphids naturally. Saved 30% on pesticide costs this season.',
    likes: 112,
    comments: 38,
    hasImage: false,
  },
];

export default function KnowledgeFeedScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [infoModal, setInfoModal] = useState({ visible: false, title: '', message: '' });
  const [writeModalVisible, setWriteModalVisible] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftCategory, setDraftCategory] = useState('Tip');
  const likeScales = useRef({}).current;

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'All') return posts;
    return posts.filter((post) => post.category === selectedCategory);
  }, [posts, selectedCategory]);

  function getLikeScale(postId) {
    if (!likeScales[postId]) {
      likeScales[postId] = new Animated.Value(1);
    }
    return likeScales[postId];
  }

  function handleLike(postId) {
    const scale = getLikeScale(postId);
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );

    Animated.sequence([
      Animated.spring(scale, { toValue: 1.22, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }

  function showComments() {
    setInfoModal({
      visible: true,
      title: 'Comments',
      message: 'Comments coming soon',
    });
  }

  function showShareOptions() {
    setInfoModal({
      visible: true,
      title: 'Share',
      message: 'Share options: WhatsApp, SMS, Copy link',
    });
  }

  function submitPost() {
    setWriteModalVisible(false);
    setDraftTitle('');
    setDraftBody('');
    setDraftCategory('Tip');

    if (Platform.OS === 'android') {
      ToastAndroid.show('Post shared successfully', ToastAndroid.SHORT);
    } else {
      Alert.alert('Success', 'Post shared successfully');
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Farmer Knowledge Feed</Text>
          <Text style={styles.subtitle}>Stay updated with latest farming tips</Text>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔎</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search tips, pests, crops..."
              placeholderTextColor="#7B8F7B"
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {CATEGORY_FILTERS.map((category) => {
            const selected = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[styles.filterChip, selected && styles.filterChipSelected]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.feedSection}>
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              likeScale={getLikeScale(post.id)}
              onLike={() => handleLike(post.id)}
              onComment={showComments}
              onShare={showShareOptions}
            />
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setWriteModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>✏️</Text>
      </TouchableOpacity>

      <InfoModal modal={infoModal} onClose={() => setInfoModal({ ...infoModal, visible: false })} />

      <Modal visible={writeModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.writeModalCard}>
            <Text style={styles.modalTitle}>Write a Post</Text>
            <TextInput
              style={styles.input}
              placeholder="Post Title"
              placeholderTextColor="#8AA08A"
              value={draftTitle}
              onChangeText={setDraftTitle}
            />
            <TextInput
              style={[styles.input, styles.bodyInput]}
              placeholder="Share your experience..."
              placeholderTextColor="#8AA08A"
              value={draftBody}
              onChangeText={setDraftBody}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.selectorLabel}>Category</Text>
            <View style={styles.writeCategoryWrap}>
              {CATEGORY_FILTERS.filter((category) => category !== 'All').map((category) => {
                const selected = draftCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[styles.writeChip, selected && styles.writeChipSelected]}
                    onPress={() => setDraftCategory(category)}
                  >
                    <Text style={[styles.writeChipText, selected && styles.writeChipTextSelected]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.postButton} onPress={submitPost} activeOpacity={0.85}>
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setWriteModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function PostCard({ post, likeScale, onLike, onComment, onShare }) {
  const category = CATEGORY_META[post.category];

  return (
    <View style={styles.postCard}>
      <View style={styles.postTopRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{post.avatar}</Text>
        </View>
        <View style={styles.farmerInfo}>
          <Text style={styles.farmerName}>{post.farmer}</Text>
          <Text style={styles.postMeta}>{post.location} • {post.time}</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: category.bg }]}>
          <Text style={[styles.categoryBadgeText, { color: category.color }]}>
            {category.emoji} {post.category}
          </Text>
        </View>
      </View>

      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postBody} numberOfLines={3}>{post.body}</Text>

      {post.hasImage && (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageEmoji}>🌾</Text>
          <Text style={styles.imageText}>Crop image preview</Text>
        </View>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike} activeOpacity={0.75}>
          <Animated.Text style={[styles.actionText, { transform: [{ scale: likeScale }] }]}>👍 {post.likes}</Animated.Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onComment} activeOpacity={0.75}>
          <Text style={styles.actionText}>💬 {post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={onShare} activeOpacity={0.75}>
          <Text style={styles.shareText}>🔗 Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoModal({ modal, onClose }) {
  return (
    <Modal visible={modal.visible} transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.infoModalCard}>
          <Text style={styles.modalTitle}>{modal.title}</Text>
          <Text style={styles.modalMessage}>{modal.message}</Text>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 58 : 42,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  title: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: '#D7F0D9',
    fontSize: 14,
    marginTop: 6,
  },
  searchBar: {
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#1B5E20',
    fontSize: 15,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 10,
  },
  filterChip: {
    backgroundColor: COLORS.white,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D7E8D2',
  },
  filterChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: '#315B33',
    fontWeight: '700',
    fontSize: 13,
  },
  filterTextSelected: {
    color: COLORS.white,
  },
  feedSection: {
    paddingHorizontal: 16,
    gap: 14,
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDEDD8',
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  postTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 24,
  },
  farmerInfo: {
    flex: 1,
    paddingRight: 8,
  },
  farmerName: {
    color: '#163D18',
    fontSize: 15,
    fontWeight: '800',
  },
  postMeta: {
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 2,
  },
  categoryBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  postTitle: {
    color: '#143915',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 14,
    lineHeight: 23,
  },
  postBody: {
    color: '#456346',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  imagePlaceholder: {
    height: 150,
    borderRadius: 18,
    backgroundColor: '#DDF2D9',
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C2E3BB',
  },
  imageEmoji: {
    fontSize: 42,
  },
  imageText: {
    color: '#4E7B4F',
    marginTop: 6,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEF5EC',
    marginTop: 14,
    paddingTop: 12,
  },
  actionButton: {
    marginRight: 18,
  },
  actionText: {
    color: '#315B33',
    fontSize: 14,
    fontWeight: '800',
  },
  shareButton: {
    marginLeft: 'auto',
  },
  shareText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: Platform.OS === 'ios' ? 34 : 24,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },
  fabText: {
    fontSize: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 35, 10, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  infoModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 22,
  },
  writeModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    color: '#143915',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 12,
  },
  modalMessage: {
    color: '#456346',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.white,
    fontWeight: '900',
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#143915',
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D7E8D2',
  },
  bodyInput: {
    minHeight: 110,
  },
  selectorLabel: {
    color: '#315B33',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },
  writeCategoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  writeChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F4FAF2',
    borderWidth: 1,
    borderColor: '#D7E8D2',
  },
  writeChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  writeChipText: {
    color: '#315B33',
    fontSize: 12,
    fontWeight: '800',
  },
  writeChipTextSelected: {
    color: COLORS.white,
  },
  postButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  postButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontWeight: '800',
  },
});
