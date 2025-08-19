//Se mandan los imports necesarios para crear el Stack Navigator
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Se importan las pantallas que se utilizarán en la navegación
import UsuariosScreen from '../screens/UsuariosScreen';
import LugaresScreen from '../screens/LugaresScreen';
import MaterialesScreen from '../screens/MaterialesScreen';
import LoginScreen from '../screens/LoginScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import ReporteScreen from '../screens/ReporteScreen';
import FallasListScreen from '../screens/FallasListScreen';

// Se define el tipo de las rutas del Stack Navigator
// Esto permite que TypeScript conozca las pantallas disponibles y sus parámetros
export type RootStackParamList = {
    Login: undefined;
    Usuarios: undefined;
    Lugares: undefined;
    Materiales: undefined;
    Barcode: undefined;
    Reporte: undefined;
    Falla: undefined;
};
// Se crea el Stack Navigator utilizando el tipo definido anteriormente
// Esto permite organizar las pantallas en una pila de navegación
const Stack = createNativeStackNavigator<RootStackParamList>();
// Se define el componente StackNavigator que contiene las pantallas y sus opciones de navegación
// Este componente se encargará de renderizar las pantallas según la navegación del usuario
export default function StackNavigator() {
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Materiales" component={MaterialesScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Usuarios" component={UsuariosScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Lugares" component={LugaresScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Barcode" component={BarcodeScannerScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Reporte" component={ReporteScreen} options={{ headerShown: false }} />  
            <Stack.Screen name="Falla" component={FallasListScreen} options={{ headerShown: false }} />             
        </Stack.Navigator>
    );
}