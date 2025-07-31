import React, { useState } from 'react';
import {
    TouchableOpacity,
    View,
    Text,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
    const [correo, setCorreo] = useState('');
    const [correoValido, setCorreoValido] = useState<boolean | null>(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    // Validación de credenciales mejorada
    const credencialesValidas = correoValido === true && password.length >= 6;

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

        // ⚡ Acceso temporal para pruebas (agregado de la screen 2)
        if (correo === 'demo@danone.com' && password === 'Demo123!') {
            AsyncStorage.setItem('logueado', 'true').then(() => {
                setError('');
                navigation.replace('Usuarios');
            });
            return;
        }

        setCargando(true);
        
        // Mantener la URL y lógica original de la screen 1
        fetch('http://18.216.41.155:3000/api/login', {
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
                navigation.replace('Usuarios'); // Mantener navegación original
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => setCargando(false));
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/images/logo_tuerca.png')}
                style={styles.image}
                resizeMode="contain"
            />
            <Text style={styles.title}>Iniciar Sesión</Text>

            {/* Input de correo con validación visual mejorada */}
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
                    setError(''); // Limpiar error al escribir
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
                        setError(''); // Limpiar error al escribir
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

            {/* Botón de login con estado mejorado */}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#F8FBFF', // Fondo azul claro estilo Bonafont
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#2C3E50',
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 10,
        fontSize: 16,
        color: '#000',
        marginBottom: 14,
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    // Nuevos estilos de validación
    inputValido: {
        borderColor: '#34C759',
        borderWidth: 2,
    },
    inputInvalido: {
        borderColor: '#FF3B30',
        borderWidth: 2,
    },
    textoValido: {
        color: '#34C759',
        fontSize: 13,
        marginBottom: 10,
        marginLeft: 5,
        fontWeight: '600',
    },
    textoError: {
        color: '#FF3B30',
        fontSize: 13,
        marginBottom: 10,
        marginLeft: 5,
        fontWeight: '600',
    },
    // Container para contraseña con toggle
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginBottom: 14,
        paddingRight: 10,
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleButton: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    toggleIcon: {
        fontSize: 18,
    },
    error: {
        textAlign: 'center',
        marginBottom: 12,
        fontSize: 14,
        color: '#FF3B30',
        fontWeight: '500',
        backgroundColor: '#FFE5E5',
        padding: 8,
        borderRadius: 6,
    },
    button: {
        backgroundColor: '#0066CC', // Azul Bonafont
        paddingVertical: 14,
        borderRadius: 25, // Más redondeado
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    // Nuevo estilo para botón deshabilitado
    buttonDisabled: {
        backgroundColor: '#B0B0B0',
        shadowOpacity: 0.1,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    image: {
        width: 180,
        height: 180,
        alignSelf: 'center',
        marginBottom: 30,
        borderRadius: 100,
        padding: 15,
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
});