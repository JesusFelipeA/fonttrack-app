import React, { useEffect, useState } from 'react';
import {
    TouchableOpacity,
    View,
    ScrollView,
    ActivityIndicator,
    Text,
    StyleSheet,
} from 'react-native';
import { obtenerLugares } from '../services/lugares';
import { Lugar } from '../types/Lugar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
    Materiales: undefined;
    Usuarios: undefined;
    Lugares: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Lugares'>;

export default function LugaresScreen({ navigation }: Props) {
    const [lugares, setLugares] = useState<Lugar[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLugares();
    }, []);

    const fetchLugares = async () => {
        try {
            const data = await obtenerLugares();
            setLugares(data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar lugares');
        } finally {
            setLoading(false);
        }
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
                    <Text style={styles.headerText}>Estado</Text>
                </View>

                {/* Filas de la tabla */}
                {lugares.map((lugar, index) => (
                    <View 
                        key={lugar.id_lugar.toString()} 
                        style={[
                            styles.tableRow, 
                            index % 2 === 0 ? styles.evenRow : styles.oddRow
                        ]}
                    >
                        <Text style={styles.cellText}>{lugar.id_lugar}</Text>
                        <Text style={styles.cellText}>{lugar.nombre || 'N/A'}</Text>
                        <Text style={styles.cellText}>{lugar.estado || 'N/A'}</Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Usuarios')}
                >
                    <Text style={styles.buttonText}>Ir a Usuarios</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Materiales')}
                >
                    <Text style={styles.buttonText}>Ir a Materiales</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F8FBFF', // Azul muy claro, como agua pura
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
        backgroundColor: '#0066CC', // Azul Bonafont
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
        borderBottomColor: '#E8F4FD', // Azul muy claro para separadores
    },
    evenRow: {
        backgroundColor: '#FFFFFF',
    },
    oddRow: {
        backgroundColor: '#F8FBFF', // Azul muy suave para filas alternas
    },
    cellText: {
        flex: 1,
        color: '#2C3E50',
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '400',
    },
    buttonContainer: {
        marginTop: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    button: {
        backgroundColor: '#0066CC', // Azul Bonafont
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 25, // Más redondeado como gota de agua
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
        flexGrow: 1,
        minWidth: '48%',
        marginVertical: 4,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});