import React, { useState } from 'react';
import {
    TouchableOpacity,
    View,
    Text,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importa los tipos necesarios para la navegación y AsyncStorage
type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

// Pantalla de inicio de sesión
// Esta pantalla permite a los usuarios ingresar sus credenciales para acceder a la aplicación.
export default function LoginScreen({ navigation }: Props) {
    const [correo, setCorreo] = useState('');
    const [correoValido, setCorreoValido] = useState<boolean | null>(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    // Validación de credenciales
    // Verifica si el correo es válido y si la contraseña tiene al menos 6 caracteres.
    const credencialesValidas = correoValido === true && password.length >= 6;

    // Maneja el evento de inicio de sesión
    // Esta función se ejecuta cuando el usuario presiona el botón de inicio de sesión.
    const handleLogin = () => {
        if (!correo || !password) {
            setError('Todos los campos son obligatorios');
            return;
        }

        // Validación adicional de correo corporativo
        if (!correo.endsWith('@danone.com')) {
            setError('Debes usar un correo corporativo @danone.com');
            return;
        }

        // Si las credenciales son válidas, procede a realizar la solicitud de inicio de sesión
        // Muestra un indicador de carga mientras se procesa la solicitud.
        setCargando(true);

        // Realiza la solicitud de inicio de sesión al servidor
        // Utiliza fetch para enviar las credenciales al endpoint de inicio de sesión.
        fetch('http://3.144.202.241:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, password }),
        })
            .then(async res => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Error desconocido');
                }

                await AsyncStorage.setItem('logueado', 'true');
                return data;
            })
            .then(() => {
                setError('');
                navigation.replace('Usuarios');
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => setCargando(false));
    };

    // Renderiza la pantalla de inicio de sesión
    // Esta función devuelve el componente principal que contiene los campos de entrada, botones y mensajes de error.
    // Utiliza estilos para mejorar la apariencia de los componentes.
    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/images/logo_tuerca.png')}
                style={styles.image}
                resizeMode="contain"
            />
            <Text style={styles.title}>Iniciar Sesión</Text>

            {/* Input de correo con validación */}
            <TextInput
                style={[
                    styles.input,
                    correoValido === false && styles.inputInvalido,
                    correoValido === true && styles.inputValido,
                ]}
                placeholder="Correo"
                placeholderTextColor="#666"
                value={correo}
                onChangeText={(text) => {
                    setCorreo(text);
                    setCorreoValido(text.endsWith('@danone.com'));
                    setError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            {/* Indicador visual de validación del correo */}
            {correo.length > 0 && correoValido !== null && (
                <Text style={correoValido ? styles.textoValido : styles.textoError}>
                    {correoValido ? '✅ Correo válido corporativo' : '❌ Usa tu correo @danone.com'}
                </Text>
            )}

            {/* Container de contraseña con toggle de visibilidad */}
            <View style={styles.passwordContainer}>
                <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0, backgroundColor: 'transparent' }]}
                    placeholder="Contraseña"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        setError('');
                    }}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.toggleButton}
                >
                    <Text style={styles.toggleIcon}>
                        {showPassword ? '🙈' : '🙉'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Mostrar errores */}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Botón de login */}
            {cargando ? (
                <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 10 }} />
            ) : (
                <TouchableOpacity
                    style={[
                        styles.button,
                        !credencialesValidas && styles.buttonDisabled
                    ]}
                    onPress={handleLogin}
                    disabled={!credencialesValidas}
                >
                    <Text style={styles.buttonText}>Ingresar</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// Estilos para la pantalla de inicio de sesión
// Estos estilos definen la apariencia de los componentes en la pantalla, utilizando colores y tamaños específicos.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
        backgroundColor: '#F9E5D5', 
        minHeight: '100%',
    },

    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 40,
        textAlign: 'center',
        color: '#2C3E50',
        letterSpacing: 0.8,
        lineHeight: 38,
        textShadowColor: 'rgba(196, 154, 108, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },

    image: {
        width: 200,
        height: 200,
        alignSelf: 'center',
        marginBottom: 48,
        borderRadius: 100,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        shadowColor: '#C49A6C',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
        backgroundColor: '#FFFFFF', 
    },

    input: {
        borderWidth: 2,
        borderColor: '#E8F4FD',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 16,
        fontSize: 16,
        color: '#2C3E50', 
        marginBottom: 20,
        fontWeight: '500',
        letterSpacing: 0.3,
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        minHeight: 56,
    },

    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E8F4FD',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 20,
        paddingLeft: 20,
        paddingRight: 8,
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        minHeight: 56,
    },

    passwordInput: {
        flex: 1,
        fontSize: 16,
        color: '#2C3E50', 
        paddingVertical: 16,
        fontWeight: '500',
        letterSpacing: 0.3,
    },

    toggleButton: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },

    toggleIcon: {
        fontSize: 22,
        color: '#0066CC',
        fontWeight: 'bold',
    },

    inputValido: {
        borderColor: '#27AE60',
        borderWidth: 2,
        backgroundColor: '#F0FDF4', 
        shadowColor: '#27AE60',
        shadowOpacity: 0.12,
    },

    inputInvalido: {
        borderColor: '#E74C3C', 
        borderWidth: 2,
        backgroundColor: '#FEF2F2', 
        shadowColor: '#E74C3C',
        shadowOpacity: 0.12,
    },

    passwordContainerValido: {
        borderColor: '#27AE60',
        borderWidth: 2,
        backgroundColor: '#F0FDF4', 
        shadowColor: '#27AE60',
        shadowOpacity: 0.12,
    },

    passwordContainerInvalido: {
        borderColor: '#E74C3C', 
        borderWidth: 2,
        backgroundColor: '#FEF2F2', 
        shadowColor: '#E74C3C',
        shadowOpacity: 0.12,
    },

    textoValido: {
        color: '#166534', 
        fontSize: 14,
        marginBottom: 16,
        marginLeft: 8,
        fontWeight: '600',
        letterSpacing: 0.2,
        backgroundColor: '#DCFCE7', 
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#27AE60',
        overflow: 'hidden',
    },

    textoError: {
        color: '#991B1B', 
        fontSize: 14,
        marginBottom: 16,
        marginLeft: 8,
        fontWeight: '600',
        letterSpacing: 0.2,
        backgroundColor: '#FEE2E2', 
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#E74C3C',
        overflow: 'hidden',
    },

    error: {
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 15,
        color: '#991B1B', 
        fontWeight: '600',
        backgroundColor: '#FEE2E2', 
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FECACA', 
        letterSpacing: 0.2,
        lineHeight: 22,
        shadowColor: '#E74C3C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },

    button: {
        backgroundColor: '#0066CC',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        marginBottom: 16,
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        minHeight: 56,
    },

    buttonDisabled: {
        backgroundColor: '#94A3B8',
        shadowColor: '#94A3B8',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },

    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#0066CC',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        marginBottom: 16,
        minHeight: 56,
    },

    secondaryButtonText: {
        color: '#0066CC',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    linkText: {
        color: '#0066CC',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 20,
        letterSpacing: 0.3,
        textDecorationLine: 'underline',
    },

    helperText: {
        color: '#7F8C8D',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
        letterSpacing: 0.2,
        lineHeight: 20,
    },

    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        marginHorizontal: 8,
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
        borderWidth: 2,
        borderColor: '#E8F4FD',
    },

    headerContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },

    footerContainer: {
        alignItems: 'center',
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#E8F4FD',
    },

    inputFocused: {
        borderColor: '#0066CC',
        backgroundColor: '#F8FBFF',
        shadowColor: '#0066CC',
        shadowOpacity: 0.2,
        shadowRadius: 16,
        borderWidth: 3,
    },

    buttonPressed: {
        transform: [{ scale: 0.98 }],
        shadowOpacity: 0.2,
    },

    toggleButtonPressed: {
        backgroundColor: '#F8FBFF',
        borderRadius: 8,
    },

    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(249, 229, 213, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
    },

    loadingText: {
        color: '#2C3E50', 
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        letterSpacing: 0.3,
    },

    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },

    decorativeElement: {
        width: 60,
        height: 4,
        backgroundColor: '#0066CC',
        borderRadius: 2,
        marginVertical: 20,
        alignSelf: 'center',
    },


    successMessage: {
        backgroundColor: '#DCFCE7', 
        borderWidth: 2,
        borderColor: '#BBF7D0',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 6,
        borderLeftColor: '#27AE60',
    },

    successText: {
        color: '#166534',
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 0.2,
    },
});