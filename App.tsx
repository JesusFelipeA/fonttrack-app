// Librerías y dependencias necesarias
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types/Navigation';
// Importa las pantallas de la aplicación
import LoginScreen from './src/screens/LoginScreen';
import MaterialesScreen from './src/screens/MaterialesScreen';
import UsuariosScreen from './src/screens/UsuariosScreen';
import LugaresScreen from './src/screens/LugaresScreen';
import BarcodeScannerScreen from './src/screens/BarcodeScannerScreen';
import ReporteScreen from './src/screens/ReporteScreen';
import FallasListScreen from './src/screens/FallasListScreen';

// Habilita las pantallas nativas para mejorar el rendimiento de la navegación
// Esto es especialmente útil para este aplicativo ya que manjea múltiples pantallas y transiciones.
// Al habilitar las pantallas nativas, se mejora la eficiencia y la experiencia del usuario
enableScreens();

// Crea el stack de navegación principal
// Define las rutas y sus parámetros para la navegación entre pantallas
const Stack = createNativeStackNavigator<RootStackParamList>();

// Define el tema personalizado para la navegación
// Este tema define los colores y estilos que se aplicarán a la navegación en toda la aplicación
const BonafontTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#E38B5B',
        background: '#F9E5D5',
        card: '#FFFFFF',
        text: '#333333',
        border: '#C49A6C',
    },
};

// Componente de pantalla de carga
// Muestra un indicador de carga mientras se verifica el estado de la sesión del usuario.
const LoadingScreen = () => (
    <View style={styles.loadingContainer}>
        <StatusBar backgroundColor="#E38B5B" barStyle="light-content" />
        <ActivityIndicator
            size="large"
            color="#E38B5B"
            style={styles.loadingIndicator}
        />
        <View style={styles.loadingText}>
            <View style={styles.loadingDot} />
            <View style={styles.loadingDot} />
            <View style={styles.loadingDot} />
        </View>
    </View>
);
// Componente principal de la aplicación
// Este componente maneja la navegación y el estado de la sesión del usuario.
export default function App() {
    const [logueado, setLogueado] = useState<boolean | null>(null);
    // Efecto para verificar el estado de la sesión del usuario al montar el componente.
    // Utiliza AsyncStorage para obtener el estado de sesión guardado y actualiza el estado local
    useEffect(() => {
        const checkSession = async () => {
            try {
                const sesion = await AsyncStorage.getItem('logueado');
                setLogueado(sesion === 'true');
            } catch (error) {
                console.error('Error al verificar sesión:', error);
                setLogueado(false);
            }
        };
        checkSession();
    }, []);

    if (logueado === null) {
        return <LoadingScreen />;
    }
// Si el usuario está logueado, muestra la navegación principal de la aplicación.
    return (
        <NavigationContainer theme={BonafontTheme}>
            <StatusBar backgroundColor="#E38B5B" barStyle="light-content" />
            <Stack.Navigator
                initialRouteName={logueado ? 'Usuarios' : 'Login'}
            >
                {/* Define las pantallas de la aplicación y sus opciones de navegación, oculta el nombre de las screens*/}
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{
                        title: 'Iniciar Sesión',
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Materiales"
                    component={MaterialesScreen}
                    options={{
                        title: 'Gestión de Materiales',
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Usuarios"
                    component={UsuariosScreen}
                    options={{
                        title: 'Gestión de Usuarios',
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Lugares"
                    component={LugaresScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="BarcodeScanner"
                    component={BarcodeScannerScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Reporte"
                    component={ReporteScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Falla"
                    component={FallasListScreen}
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
// Estilos globales para la aplicación
// Define los estilos que se aplicarán a los componentes de la aplicación, como el contenedor de carga y los indicadores de estado.
// Estos estilos aseguran una apariencia consistente y atractiva en toda la aplicación.
const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9E5D5',
    },

    loadingIndicator: {
        marginBottom: 32,
        transform: [{ scale: 1.5 }],
    },

    loadingText: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    loadingDot: {
        width: 8,
        height: 8,
        backgroundColor: '#E38B5B',
        borderRadius: 4,
        marginHorizontal: 4,
        opacity: 0.7,
    },

    screenContainer: {
        flex: 1,
        backgroundColor: '#F9E5D5',
    },

    headerContainer: {
        backgroundColor: '#E38B5B',
        paddingHorizontal: 20,
        paddingVertical: 16,
        shadowColor: '#C49A6C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },

    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 0.5,
        textAlign: 'center',
        textTransform: 'uppercase',
    },

    tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopColor: '#F6B88F',
        borderTopWidth: 2,
        paddingBottom: 8,
        paddingTop: 8,
        height: 70,
        shadowColor: '#C49A6C',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },

    tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
        marginTop: 4,
    },

    tabBarIconStyle: {
        marginBottom: 2,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(100, 77, 59, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    errorBoundary: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9E5D5',
        padding: 32,
    },

    errorText: {
        color: '#C0392B',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 0.3,
        lineHeight: 26,
    },

    safeArea: {
        flex: 1,
        backgroundColor: '#E38B5B',
    },

    safeAreaContent: {
        flex: 1,
        backgroundColor: '#F9E5D5',
    },
});