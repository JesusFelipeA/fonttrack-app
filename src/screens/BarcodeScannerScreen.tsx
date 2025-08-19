//Se encuentra el código fuente de la pantalla de escaneo de códigos de barras en una aplicación React Native.
// Esta pantalla utiliza la cámara del dispositivo para escanear códigos de barras y redirigir
// al usuario a una pantalla específica con el código escaneado. También maneja permisos de cámara y muestra mensajes de error si es necesario.
// El código incluye estilos personalizados y una estructura básica de navegación utilizando React Navigation.
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
// Importa RNCamera de react-native-camera para manejar la cámara y escanear códigos de barras.
import { RNCamera } from 'react-native-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define el tipo de parámetros de navegación para la pila de navegación.
// En este caso, la pantalla de escaneo de códigos de barras no recibe parámetros específicos, pero la pantalla de materiales puede recibir un código escaneado.
type RootStackParamList = {
    Materiales: { scanCode?: string };
    Usuarios: undefined;
    Lugares: undefined;
    BarcodeScanner: undefined;
};
// Define el tipo de navegación para la pantalla de escaneo de códigos de barras.
// Utiliza NativeStackNavigationProp para obtener las propiedades de navegación específicas de la pila.
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BarcodeScanner'>;

// Componente principal de la pantalla de escaneo de códigos de barras.
// Utiliza useRef para mantener una referencia a la cámara y useState para manejar el estado de si se ha escaneado un código y si se tiene permiso para usar la cámara.
export default function BarcodeScannerScreen() {
    const cameraRef = useRef<RNCamera>(null);
    const navigation = useNavigation<NavigationProp>();
    const [scanned, setScanned] = useState(false);
    const [cameraPermission, setCameraPermission] = useState(true);

    // Efecto para solicitar permiso de cámara al montar el componente.
    // En Android, se solicita el permiso de cámara y se maneja la respuesta del usuario
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
    // Función para manejar el evento de escaneo de códigos de barras.
    // Si no se ha escaneado un código previamente, actualiza el estado y navega a la pantalla de materiales con el código escaneado.
    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (!scanned) {
            setScanned(true);
            navigation.replace('Materiales', { scanCode: data });
        }
    };
    // Si no se tiene permiso para usar la cámara, muestra un mensaje de error y un botón para volver atrás.
    // Si se tiene permiso, renderiza la vista de la cámara con un marco de escaneo y un mensaje de instrucción.
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
    // Renderiza la vista de la cámara con un marco de escaneo y un mensaje de instrucción.
    // Utiliza RNCamera para manejar la cámara y el escaneo de códigos de barras.
    // También incluye un botón para cancelar el escaneo y volver a la pantalla anterior.
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
// Estilos personalizados para la pantalla de escaneo de códigos de barras.
// Incluye estilos para la cámara, el marco de escaneo, los textos y los botones.
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
