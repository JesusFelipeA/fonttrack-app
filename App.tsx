import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types/Navigation';

import LoginScreen from './src/screens/LoginScreen';
import MaterialesScreen from './src/screens/MaterialesScreen';
import UsuariosScreen from './src/screens/UsuariosScreen';
import LugaresScreen from './src/screens/LugaresScreen';
import BarcodeScannerScreen from './src/screens/BarcodeScannerScreen';
import ReporteScreen from './src/screens/ReporteScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    const [logueado, setLogueado] = useState<boolean | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            const sesion = await AsyncStorage.getItem('logueado');
            setLogueado(sesion === 'true');
        };
        checkSession();
    }, []);

    if (logueado === null) {
        return null; // aquí podrías mostrar un splash screen
    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={logueado ? 'Login' : 'Login'}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Materiales" component={MaterialesScreen} />
                <Stack.Screen name="Usuarios" component={UsuariosScreen} />
                <Stack.Screen name="Lugares" component={LugaresScreen} />
                <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
                <Stack.Screen name="Reporte" component={ReporteScreen}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}
