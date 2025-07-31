import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UsuariosScreen from '../screens/UsuariosScreen';
import LugaresScreen from '../screens/LugaresScreen';
import MaterialesScreen from '../screens/MaterialesScreen';
import LoginScreen from '../screens/LoginScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import ReporteScreen from '../screens/ReporteScreen';


export type RootStackParamList = {
    Login: undefined;
    Welcome: undefined; // Pantalla de bienvenida después del login
    Usuarios: undefined;
    Lugares: undefined;
    Materiales: undefined;
    Barcode: undefined;
    Reporte: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Materiales" component={MaterialesScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Usuarios" component={UsuariosScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Lugares" component={LugaresScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Barcode" component={BarcodeScannerScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Reporte" component={ReporteScreen} options={{ headerShown: false }} />                     
        </Stack.Navigator>
    );
}