import { useRef } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

type Props = {
  visible: boolean;
  email: string;
  amount: number;
  reference: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
};

export function PaystackCheckout({
  visible,
  email,
  amount,
  reference,
  onSuccess,
  onClose,
}: Props) {
  const handled = useRef(false);
  const publicKey = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

  const html = `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:sans-serif;padding:24px;">
  <p>Loading Paystack...</p>
  <script src="https://js.paystack.co/v1/inline.js"></script>
  <script>
    function pay() {
      var handler = PaystackPop.setup({
        key: '${publicKey}',
        email: '${email.replace(/'/g, "\\'")}',
        amount: ${Math.round(amount * 100)},
        currency: 'GHS',
        ref: '${reference}',
        callback: function(response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'success', reference: response.reference }));
        },
        onClose: function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'closed' }));
        }
      });
      handler.openIframe();
    }
    pay();
  </script>
</body>
</html>`;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <WebView
          source={{ html }}
          onMessage={(e) => {
            if (handled.current) return;
            try {
              const data = JSON.parse(e.nativeEvent.data);
              if (data.status === 'success') {
                handled.current = true;
                onSuccess(data.reference);
              } else if (data.status === 'closed') {
                onClose();
              }
            } catch {
              /* ignore */
            }
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 48 },
});
