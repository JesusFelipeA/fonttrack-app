import React, { useEffect, useState } from 'react';
import {
    TouchableOpacity,
    View,
    ScrollView,
    ActivityIndicator,
    Text,
    StyleSheet,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { obtenerUsuarios } from '../services/usuarios';
import { Usuario } from '../types/Usuario';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Define el tipo para la navegación y las rutas de la aplicación
type RootStackParamList = {
    Materiales: undefined;
    Usuarios: undefined;
    Lugares: undefined;
    Login: undefined;
    Falla: undefined;
};

// Define the props para el componente de UsuariosScreen
type Props = NativeStackScreenProps<RootStackParamList, 'Usuarios'>;

export default function UsuariosScreen({ navigation }: Props) {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Efecto para cargar los usuarios al montar el componente
    useEffect(() => {
        fetchUsuarios();
    }, []);
    // Función para obtener los usuarios desde el servicio
    const fetchUsuarios = async () => {
        try {
            const data = await obtenerUsuarios();
            setUsuarios(data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };
    // Función para manejar el cierre de sesión
    // Muestra una alerta de confirmación antes de cerrar sesión
    const handleLogout = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sí, cerrar sesión',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('logueado');
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    },
                },
            ]
        );
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />;
    }

    if (error) {
        return <Text style={styles.error}>{error}</Text>;
    }
// Renderiza la lista de usuarios
    return (
        <View style={styles.container}>
            <ScrollView style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                    <Text style={styles.headerText}>ID</Text>
                    <Text style={styles.headerText}>Nombre</Text>
                    <Text style={styles.headerText}>Email</Text>
                    <Text style={styles.headerText}>Rol</Text>
                </View>

                {usuarios.map((usuario, index) => (
                    <View
                        key={usuario.id_usuario.toString()}
                        style={[
                            styles.tableRow,
                            index % 2 === 0 ? styles.evenRow : styles.oddRow
                        ]}
                    >
                        <Text style={styles.cellText}>{usuario.id_usuario}</Text>
                        <Text style={styles.cellText}>{usuario.nombre || 'N/A'}</Text>
                        <Text style={styles.cellText}>{usuario.correo || 'N/A'}</Text>
                        <Text style={styles.cellText}>{usuario.tipo_usuario || 'N/A'}</Text>
                    </View>
                ))}
            </ScrollView>
            {/* Botones de navegación para otras pantallas */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Materiales')}>
                    <Text style={styles.buttonText}>Materiales</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Lugares')}>
                    <Text style={styles.buttonText}>Lugares</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Falla')}>
                    <Text style={styles.buttonText}>Fallas</Text>
                </TouchableOpacity>
            </View>
            {/* Botón para cerrar sesión */}
            <View style={styles.logoutButton}>
                <TouchableOpacity style={styles.smallButton} onPress={handleLogout}>
                    <Text style={styles.buttonText}>Cerrar sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
// Estilos para el componente UsuariosScreen
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F9E5D5',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        color: '#C0392B',
        textAlign: 'center',
        marginTop: 24,
        fontSize: 16,
        fontWeight: '500',
    },
    tableContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#C49A6C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#E38B5B',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    headerText: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F6B88F',
    },
    evenRow: {
        backgroundColor: '#FFFFFF',
    },
    oddRow: {
        backgroundColor: '#F9E5D5',
    },
    cellText: {
        flex: 1,
        color: '#634D3B',
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '400',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        marginTop: 1,
    },
    button: {
        backgroundColor: '#E38B5B',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#E38B5B',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
        width: 100,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    logoutButton: {
        marginTop: 2,
        alignItems: 'center',
    },
    smallButton: {
        backgroundColor: '#F4A978',
        paddingVertical: 6,
        paddingHorizontal: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#F4A978',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
        width: 100,
    },
});
