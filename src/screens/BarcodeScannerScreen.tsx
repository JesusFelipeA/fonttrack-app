import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    PermissionsAndroid,
    Platform,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    Materiales: { scanCode?: string };
    Usuarios: undefined;
    Lugares: undefined;
    BarcodeScanner: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BarcodeScanner'>;

export default function BarcodeScannerScreen() {
    const cameraRef = useRef<RNCamera>(null);
    const navigation = useNavigation<NavigationProp>();
    const [scanned, setScanned] = useState(false);
    const [cameraPermission, setCameraPermission] = useState(true);

    useEffect(() => {
        const requestCameraPermission = async () => {
            if (Platform.OS === 'android') {
                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.CAMERA,
                        {
                            title: 'Permiso de Cámara',
                            message: 'La app necesita acceso a tu cámara para escanear códigos.',
                            buttonNeutral: 'Preguntar luego',
                            buttonNegative: 'Cancelar',
                            buttonPositive: 'Aceptar',
                        }
                    );

                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        Alert.alert('Permiso denegado', 'No puedes escanear sin acceso a la cámara.');
                        setCameraPermission(false);
                    }
                } catch (err) {
                    console.warn(err);
                }
            }
        };

        requestCameraPermission();
    }, []);

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (!scanned) {
            setScanned(true);
            navigation.replace('Materiales', { scanCode: data });
        }
    };

    if (!cameraPermission) {
        return (
            <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
                <Text style={[styles.errorText, { color: '#000000' }]}>
                    Permiso de cámara denegado.
                </Text>
                <TouchableOpacity
                    style={[styles.cancelButton, { backgroundColor: '#DDDDDD' }]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={[styles.cancelText, { color: '#000000' }]}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <RNCamera
                ref={cameraRef}
                style={styles.camera}
                type={RNCamera.Constants.Type.back}
                captureAudio={false}
                onBarCodeRead={handleBarCodeScanned}
                androidCameraPermissionOptions={{
                    title: 'Permiso para usar la cámara',
                    message: 'Necesitamos usar tu cámara para escanear códigos',
                    buttonPositive: 'Aceptar',
                    buttonNegative: 'Cancelar',
                }}
            >
                <View style={styles.scannerFrame} />
                <View style={styles.overlay}>
                    <Text style={styles.text}>Escanea un código de barras</Text>
                </View>
            </RNCamera>

            <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: '#DDDDDD' }]}
                onPress={() => navigation.goBack()}
            >
                <Text style={[styles.cancelText, { color: '#000000' }]}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    camera: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 40,
        width: '100%',
        alignItems: 'center',
    },
    text: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        borderRadius: 10,
    },
    cancelButton: {
        padding: 15,
        alignItems: 'center',
        marginBottom: 10,
        borderRadius: 8,
        backgroundColor: '#DDDDDD',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },
    errorText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 18,
        fontWeight: '600',
    },
    scannerFrame: {
        position: 'absolute',
        top: '35%',
        left: '15%',
        width: '70%',
        height: 200,
        borderWidth: 3,
        borderColor: '#00FF00',
        borderRadius: 8,
        zIndex: 10,
    },
});
