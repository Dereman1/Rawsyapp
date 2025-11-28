import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput as RNTextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Text, Appbar, List, Surface, useTheme as usePaperTheme, SegmentedButtons, TextInput, Button, Card, Chip, Divider } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import api from '../services/api';

interface FAQ {
  _id?: string;
  question: string;
  answer: string;
  tags?: string[];
}

interface Ticket {
  _id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  adminReply?: string;
  attachments?: Array<{ filename: string; url: string }>;
  adminAttachments?: Array<{ filename: string; url: string }>;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

const HelpSupportScreen: React.FC = () => {
  const { theme } = useTheme();
  const paperTheme = usePaperTheme();
  const { t } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('faq');
  const [search, setSearch] = useState<string>('');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'faq') {
      fetchFAQs();
    } else {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/support/faq');
      setFaqs(response.data.faqs || []);
      setError('');
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/support/ticket/mine');
      setTickets(response.data.tickets || []);
      setError('');
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'faq') {
      await fetchFAQs();
    } else {
      await fetchTickets();
    }
    setRefreshing(false);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSubmitTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please provide both subject and message');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('subject', subject.trim());
      formData.append('message', message.trim());

      if (selectedFile) {
        const fileToUpload: any = {
          uri: selectedFile.uri,
          type: selectedFile.mimeType || 'application/octet-stream',
          name: selectedFile.name,
        };
        formData.append('attachment', fileToUpload);
      }

      await api.post('/support/ticket', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Your support ticket has been submitted successfully');
      setSubject('');
      setMessage('');
      setSelectedFile(null);
      await fetchTickets();
    } catch (err: any) {
      console.error('Error submitting ticket:', err);
      Alert.alert('Error', err.response?.data?.error || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#f59e0b';
      case 'in_progress':
        return '#3b82f6';
      case 'resolved':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('helpSupport') ?? "Help & Support"} />
      </Appbar.Header>

      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { value: 'faq', label: 'FAQs', icon: 'help-circle' },
            { value: 'tickets', label: 'Support Tickets', icon: 'ticket' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[paperTheme.colors.primary]} />
        }
      >
        {activeTab === 'faq' ? (
          <>
            <Surface style={[styles.searchContainer, { backgroundColor: paperTheme.colors.surface }]}>
              <RNTextInput
                placeholder={t('askQuestion') ?? "Type your question..."}
                placeholderTextColor={paperTheme.colors.onSurfaceVariant}
                value={search}
                onChangeText={setSearch}
                style={[styles.searchInput, { color: paperTheme.colors.onSurface }]}
              />
            </Surface>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={paperTheme.colors.primary} />
                <Text style={{ color: paperTheme.colors.onSurfaceVariant, marginTop: 12 }}>
                  Loading FAQs...
                </Text>
              </View>
            )}

            {error && !loading && (
              <Surface style={[styles.errorContainer, { backgroundColor: paperTheme.colors.errorContainer }]}>
                <Text style={{ color: paperTheme.colors.error, padding: 16 }}>
                  {error}
                </Text>
              </Surface>
            )}

            {!loading && !error && (
              <Surface style={[styles.faqContainer, { backgroundColor: paperTheme.colors.surface }]}>
                {filteredFAQs.length === 0 ? (
                  <Text style={{ color: paperTheme.colors.onSurfaceVariant, padding: 16 }}>
                    {t('noResults') ?? "No matching results found."}
                  </Text>
                ) : (
                  filteredFAQs.map((faq, index) => (
                    <List.Accordion
                      key={faq._id || index}
                      title={faq.question}
                      titleStyle={{ color: paperTheme.colors.onSurface }}
                      style={{ backgroundColor: paperTheme.colors.surface }}
                    >
                      <List.Item
                        title={faq.answer}
                        titleNumberOfLines={10}
                        titleStyle={{ color: paperTheme.colors.onSurfaceVariant }}
                      />
                    </List.Accordion>
                  ))
                )}
              </Surface>
            )}
          </>
        ) : (
          <>
            <Surface style={[styles.createTicketCard, { backgroundColor: paperTheme.colors.surface }]} elevation={2}>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Create Support Ticket
              </Text>

              <TextInput
                label="Subject *"
                value={subject}
                onChangeText={setSubject}
                mode="outlined"
                style={styles.input}
                disabled={submitting}
              />

              <TextInput
                label="Message *"
                value={message}
                onChangeText={setMessage}
                mode="outlined"
                multiline
                numberOfLines={6}
                style={styles.input}
                disabled={submitting}
              />

              <View style={styles.attachmentSection}>
                <Button
                  mode="outlined"
                  icon="paperclip"
                  onPress={pickDocument}
                  disabled={submitting}
                  style={styles.attachButton}
                >
                  {selectedFile ? 'Change Attachment' : 'Attach File (Optional)'}
                </Button>
                {selectedFile && (
                  <View style={styles.fileInfo}>
                    <MaterialIcons name="insert-drive-file" size={20} color={paperTheme.colors.primary} />
                    <Text variant="bodySmall" style={styles.fileName}>
                      {selectedFile.name}
                    </Text>
                    <MaterialIcons
                      name="close"
                      size={20}
                      color={paperTheme.colors.error}
                      onPress={() => setSelectedFile(null)}
                    />
                  </View>
                )}
              </View>

              <Button
                mode="contained"
                onPress={handleSubmitTicket}
                loading={submitting}
                disabled={submitting}
                icon="send"
                style={styles.submitButton}
              >
                Submit Ticket
              </Button>
            </Surface>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              My Support Tickets
            </Text>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={paperTheme.colors.primary} />
                <Text style={{ color: paperTheme.colors.onSurfaceVariant, marginTop: 12 }}>
                  Loading tickets...
                </Text>
              </View>
            )}

            {error && !loading && (
              <Surface style={[styles.errorContainer, { backgroundColor: paperTheme.colors.errorContainer }]}>
                <Text style={{ color: paperTheme.colors.error, padding: 16 }}>
                  {error}
                </Text>
              </Surface>
            )}

            {!loading && !error && tickets.length === 0 && (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="confirmation-number" size={64} color={paperTheme.colors.onSurfaceVariant} />
                <Text style={{ color: paperTheme.colors.onSurfaceVariant, marginTop: 12 }}>
                  No support tickets yet
                </Text>
              </View>
            )}

            {!loading && !error && tickets.length > 0 && (
              <View style={styles.ticketsList}>
                {tickets.map((ticket) => (
                  <Card key={ticket._id} style={styles.ticketCard}>
                    <Card.Content>
                      <View style={styles.ticketHeader}>
                        <Text variant="titleMedium" style={styles.ticketSubject}>
                          {ticket.subject}
                        </Text>
                        <Chip
                          style={{ backgroundColor: getStatusColor(ticket.status) }}
                          textStyle={{ color: '#fff', fontSize: 11 }}
                        >
                          {getStatusLabel(ticket.status)}
                        </Chip>
                      </View>

                      <Text variant="bodySmall" style={[styles.ticketDate, { color: paperTheme.colors.onSurfaceVariant }]}>
                        {new Date(ticket.createdAt).toLocaleDateString()} at {new Date(ticket.createdAt).toLocaleTimeString()}
                      </Text>

                      <Divider style={styles.ticketDivider} />

                      <Text variant="bodyMedium" style={styles.ticketMessage}>
                        {ticket.message}
                      </Text>

                      {ticket.attachments && ticket.attachments.length > 0 && (
                        <View style={styles.attachmentsSection}>
                          <Text variant="labelSmall" style={{ color: paperTheme.colors.onSurfaceVariant, marginBottom: 4 }}>
                            Attachments:
                          </Text>
                          {ticket.attachments.map((att, idx) => (
                            <View key={idx} style={styles.attachmentItem}>
                              <MaterialIcons name="insert-drive-file" size={16} color={paperTheme.colors.primary} />
                              <Text variant="bodySmall" style={{ marginLeft: 4 }}>
                                {att.filename}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {ticket.adminReply && (
                        <Surface style={[styles.adminReplyBox, { backgroundColor: paperTheme.colors.primaryContainer }]} elevation={0}>
                          <View style={styles.adminReplyHeader}>
                            <MaterialIcons name="support-agent" size={18} color={paperTheme.colors.primary} />
                            <Text variant="labelMedium" style={{ color: paperTheme.colors.primary, marginLeft: 6 }}>
                              Admin Reply
                            </Text>
                          </View>
                          <Text variant="bodyMedium" style={[styles.adminReplyText, { color: paperTheme.colors.onPrimaryContainer }]}>
                            {ticket.adminReply}
                          </Text>
                          {ticket.adminAttachments && ticket.adminAttachments.length > 0 && (
                            <View style={styles.attachmentsSection}>
                              {ticket.adminAttachments.map((att, idx) => (
                                <View key={idx} style={styles.attachmentItem}>
                                  <MaterialIcons name="insert-drive-file" size={16} color={paperTheme.colors.primary} />
                                  <Text variant="bodySmall" style={{ marginLeft: 4 }}>
                                    {att.filename}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </Surface>
                      )}

                      {ticket.resolvedAt && (
                        <Text variant="bodySmall" style={[styles.resolvedText, { color: '#10b981' }]}>
                          Resolved on {new Date(ticket.resolvedAt).toLocaleDateString()}
                        </Text>
                      )}
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default HelpSupportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 0,
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    fontSize: 16,
    height: 40,
  },
  faqContainer: {
    borderRadius: 12,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  errorContainer: {
    borderRadius: 8,
    marginBottom: 16,
  },
  createTicketCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  attachmentSection: {
    marginBottom: 16,
  },
  attachButton: {
    marginBottom: 8,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  fileName: {
    flex: 1,
  },
  submitButton: {
    paddingVertical: 6,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  ticketsList: {
    gap: 12,
  },
  ticketCard: {
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketSubject: {
    flex: 1,
    fontWeight: '600',
    marginRight: 12,
  },
  ticketDate: {
    marginBottom: 8,
  },
  ticketDivider: {
    marginVertical: 12,
  },
  ticketMessage: {
    lineHeight: 20,
    marginBottom: 8,
  },
  attachmentsSection: {
    marginTop: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  adminReplyBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  adminReplyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  adminReplyText: {
    lineHeight: 20,
  },
  resolvedText: {
    marginTop: 8,
    fontWeight: '500',
  },
});
