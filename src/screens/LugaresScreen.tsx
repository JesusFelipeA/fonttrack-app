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

// Definición de los parámetros de navegación para la pantalla Lugares
// Esta lista define las pantallas que pueden ser navegadas desde la pantalla Lugares.
type RootStackParamList = {
    Materiales: undefined;
    Usuarios: undefined;
    Lugares: undefined;
};

// Props para la pantalla Lugares
// Utiliza NativeStackScreenProps para definir las propiedades de navegación y ruta que se pasan a la pantalla.
// Esto permite acceder a la navegación y a los parámetros de la ruta.
type Props = NativeStackScreenProps<RootStackParamList, 'Lugares'>;

// Componente principal de la pantalla Lugares
// Este componente se encarga de mostrar una lista de lugares obtenidos desde un servicio.
export default function LugaresScreen({ navigation }: Props) {
    const [lugares, setLugares] = useState<Lugar[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Efecto para cargar los lugares al montar el componente
    // Utiliza useEffect para llamar a fetchLugares una vez que el componente se ha montado.
    // Esto asegura que los datos se obtengan al inicio y se actualicen en la pantalla.
    // Si ocurre un error durante la carga, se muestra un mensaje de error.
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

    // Renderiza la pantalla de lugares
    // Muestra un indicador de carga mientras se obtienen los datos.
    if (loading) {
        return <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />;
    }

    // Si hay un error, muestra un mensaje de error
    // Utiliza un componente Text para mostrar el mensaje de error en la pantalla.
    if (error) {
        return <Text style={styles.error}>{error}</Text>;
    }

    // Renderiza la lista de lugares
    // Utiliza un ScrollView para permitir el desplazamiento si hay muchos lugares.
    return (
        <View style={styles.container}>
            <ScrollView style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                    <Text style={styles.headerText}>ID</Text>
                    <Text style={styles.headerText}>Nombre</Text>
                    <Text style={styles.headerText}>Estado</Text>
                </View>

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

            {/* Botones para navegar a otras pantallas */}
            {/* Estos botones permiten al usuario navegar a las pantallas de Usuarios y Materiales */}
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

// Estilos para la pantalla Lugares
// Estos estilos definen la apariencia de los componentes en la pantalla, utilizando colores y tamaños específicos.
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
        marginTop: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    button: {
        backgroundColor: '#E38B5B', 
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#E38B5B',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
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