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

type RootStackParamList = {
    Materiales: undefined;
    Usuarios: undefined;
    Lugares: undefined;
    Login: undefined;
    Welcome: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Usuarios'>;

export default function UsuariosScreen({ navigation }: Props) {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsuarios();
    }, []);

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

    return (
        <View style={styles.container}>
            <ScrollView style={styles.tableContainer}>
                {/* Encabezado de la tabla */}
                <View style={styles.tableHeader}>
                    <Text style={styles.headerText}>ID</Text>
                    <Text style={styles.headerText}>Nombre</Text>
                    <Text style={styles.headerText}>Email</Text>
                    <Text style={styles.headerText}>Rol</Text>
                </View>

                {/* Filas de la tabla */}
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

            {/* Botones alineados horizontalmente */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Materiales')}>
                    <Text style={styles.buttonText}>Materiales</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Lugares')}>
                    <Text style={styles.buttonText}>Lugares</Text>
                </TouchableOpacity>
            </View>

            {/* Botón de logout */}
            <View style={styles.logoutButton}>
                <TouchableOpacity style={styles.smallButton} onPress={handleLogout}>
                    <Text style={styles.buttonText}>Cerrar sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F8FBFF',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        color: '#E74C3C',
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
        elevation: 3,
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#0066CC',
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
        borderBottomColor: '#E8F4FD',
    },
    evenRow: {
        backgroundColor: '#FFFFFF',
    },
    oddRow: {
        backgroundColor: '#F8FBFF',
    },
    cellText: {
        flex: 1,
        color: '#2C3E50',
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
        backgroundColor: '#0066CC',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
        width: 130,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    logoutButton: {
        marginTop: 2,
        alignItems: 'center',
    },
    smallButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 6,
        paddingHorizontal: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 1,
        width: 100,
    },
});
