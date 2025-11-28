import { useState } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import {
  Dialog,
  Portal,
  Text,
  Button,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

interface PaymentUploadDialogProps {
  visible: boolean;
  onDismiss: () => void;
  orderId: string;
  onSuccess: () => void;
}

export default function PaymentUploadDialog({
  visible,
  onDismiss,
  orderId,
  onSuccess,
}: PaymentUploadDialogProps) {
  const { theme } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload payment proof');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select a payment proof image');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();

      const imageFile: any = {
        uri: selectedImage,
        type: 'image/jpeg',
        name: `payment_${orderId}_${Date.now()}.jpg`,
      };

      formData.append('file', imageFile);

      const response = await api.post(
        `/orders/${orderId}/upload-proof`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? (progressEvent.loaded / progressEvent.total)
              : 0;
            setUploadProgress(progress);
          },
        }
      );

      Alert.alert(
        'Success',
        'Payment proof uploaded successfully. The supplier will review it shortly.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedImage(null);
              setUploadProgress(0);
              onDismiss();
              onSuccess();
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('Upload error:', err);
      Alert.alert('Error', err.response?.data?.error || 'Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedImage(null);
    setUploadProgress(0);
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleCancel} style={styles.dialog}>
        <Dialog.Title>Upload Payment Proof</Dialog.Title>

        <Dialog.Content>
          <View style={styles.infoBox}>
            <Text variant="bodyMedium" style={styles.infoText}>
              Upload a screenshot or photo of your payment confirmation. Accepted formats: JPG, PNG
            </Text>
          </View>

          <Divider style={styles.divider} />

          {selectedImage ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <Button
                mode="outlined"
                onPress={pickImage}
                disabled={uploading}
                style={styles.changeButton}
              >
                Change Image
              </Button>
            </View>
          ) : (
            <Button
              mode="contained"
              onPress={pickImage}
              icon="image"
              style={styles.selectButton}
            >
              Select Image from Gallery
            </Button>
          )}

          {uploading && (
            <View style={styles.progressContainer}>
              <Text variant="bodySmall" style={styles.progressText}>
                Uploading... {Math.round(uploadProgress * 100)}%
              </Text>
              <ProgressBar progress={uploadProgress} color={theme.colors.primary} />
            </View>
          )}
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={handleCancel} disabled={uploading}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleUpload}
            loading={uploading}
            disabled={uploading || !selectedImage}
          >
            Upload
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
  },
  infoBox: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoText: {
    color: '#4b5563',
    lineHeight: 20,
  },
  divider: {
    marginVertical: 16,
  },
  imagePreview: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  changeButton: {
    width: '100%',
  },
  selectButton: {
    marginVertical: 8,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressText: {
    marginBottom: 8,
    textAlign: 'center',
    color: '#6b7280',
  },
});
