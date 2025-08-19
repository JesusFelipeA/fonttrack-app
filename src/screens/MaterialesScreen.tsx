import React, { useEffect, useState } from 'react';
import {
    TouchableOpacity,
    View,
    FlatList,
    ActivityIndicator,
    Text,
    StyleSheet,
    TextInput,
    Alert,
} from 'react-native';
//Imposta la librería de código de barras
import Barcode from '@adrianso/react-native-barcode-builder';
import { obtenerMateriales } from '../services/materiales';
import { Material } from '../types/Material';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Definición de los tipos de navegación
type RootStackParamList = {
    Materiales: { scanCode?: string; material?: Material } | undefined;
    Usuarios: undefined;
    Lugares: undefined;
    BarcodeScanner: undefined;
    Reporte: undefined;
};
// Props para la pantalla MaterialesScreen
type Props = NativeStackScreenProps<RootStackParamList, 'Materiales'>;

// Componente principal de la pantalla MaterialesScreen
export default function MaterialesScreen({ navigation, route }: Props) {
    // Estados para manejar los materiales, carga, error, búsqueda, paginación y código de barras.
    const [materiales, setMateriales] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [barcodeVisible, setBarcodeVisible] = useState(false);
    const [barcodeValue, setBarcodeValue] = useState('');
    const itemsPerPage = 20;
    // Estado para manejar el material escaneado
    const [materialEscaneado, setMaterialEscaneado] = useState<Material | null>(null);
    // Efecto para manejar la navegación y los parámetros de la ruta
    useEffect(() => {
        if (route.params?.material) {
            const material = route.params.material;
            setMateriales([material]);
            setBarcodeValue(material.clave_material || '');
            setMaterialEscaneado(material);
            setBarcodeVisible(true);
        }
        else if (route.params?.scanCode) {
            setSearch(route.params.scanCode);
            setPage(1);
        }
    }, [route.params?.material, route.params?.scanCode]);
    // Efecto para obtener los materiales al cargar la pantalla
    useEffect(() => {
        (async () => {
            try {
                const data = await obtenerMateriales();
                setMateriales(data);
            } catch {
                setError('Error al cargar materiales');
            } finally {
                setLoading(false);
            }
        })();
    }, []);
    // Filtrado y paginación de los materiales
    const filtered = materiales.filter((mat) =>
        [mat.id_material, mat.clave_material, mat.descripcion, mat.generico,
        mat.clasificacion, mat.existencia, mat.costo_promedio, mat.id_lugar]
            .some(v => String(v).toLowerCase().includes(search.toLowerCase()))
    );
    // Paginación de los materiales filtrados
    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    // Función para manejar la generación del código de barras
    const handleShowBarcode = (mat: Material) => {
        const raw = String(mat.clave_material || '').trim();
        if (!raw) {
            return Alert.alert('Error', 'Clave inválida para generar código de barras.');
        }
        setBarcodeValue(raw);
        setMaterialEscaneado(mat);
        setBarcodeVisible(true);
    };
    // Si hay un material escaneado, se muestra el código de barras.
    if (loading) {
        return <ActivityIndicator style={styles.loader} size="large" color="#0066CC" />;
    }
    if (error) {
        return <Text style={styles.error}>{error}</Text>;
    }

    // Función para calcular el ancho de la línea del código de barras según la longitud del valor.
    const calcularAnchoLinea = (valor: string) => {
        if (valor.length <= 6) return 2.5;
        if (valor.length <= 12) return 2;
        if (valor.length <= 20) return 1.5;
        return 1;
    };
    // Función para formatear el precio a dos decimales
    const formatearPrecio = (precio: any): string => {
        if (precio == null || precio === undefined) return '0.00';
        const numero = typeof precio === 'string' ? parseFloat(precio) : precio;
        return isNaN(numero) ? '0.00' : numero.toFixed(2);
    };

    // Renderizado del componente
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar material..."
                placeholderTextColor="#7F8C8D"
                value={search}
                onChangeText={t => { setSearch(t); setPage(1); }}
            />

            <Text style={styles.resultCount}>
                {filtered.length} materiales encontrados
            </Text>

            <FlatList
                data={paginated}
                keyExtractor={i => i.id_material.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>{item.descripcion}</Text>
                            <Text style={styles.cardId}>ID: {item.id_material}</Text>
                        </View>
                        <Text style={styles.cardDetail}>Clave: {item.clave_material}</Text>
                        <Text style={styles.cardDetail}>Genérico: {item.generico}</Text>
                        <Text style={styles.cardDetail}>Existencia: {item.existencia}</Text>
                        <Text style={styles.cardDetail}>Costo: ${formatearPrecio(item.costo_promedio)}</Text>

                        <TouchableOpacity
                            style={styles.barcodeButton}
                            onPress={() => handleShowBarcode(item)}
                        >
                            <Text style={styles.barcodeButtonText}>
                                📊 Generar Código de Barras
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.pagination}>
                <TouchableOpacity
                    style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
                    onPress={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                >
                    <Text style={[styles.pageButtonText, page === 1 && styles.pageButtonTextDisabled]}>
                        ←
                    </Text>
                </TouchableOpacity>

                <Text style={styles.pageText}>Página {page}</Text>

                <TouchableOpacity
                    style={[styles.pageButton, page >= Math.ceil(filtered.length / itemsPerPage) && styles.pageButtonDisabled]}
                    onPress={() => setPage(p =>
                        p < Math.ceil(filtered.length / itemsPerPage) ? p + 1 : p
                    )}
                    disabled={page >= Math.ceil(filtered.length / itemsPerPage)}
                >
                    <Text style={[styles.pageButtonText, page >= Math.ceil(filtered.length / itemsPerPage) && styles.pageButtonTextDisabled]}>
                        →
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.navButtons}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Reporte')}>
                    <Text style={styles.buttonText}>🗃️ Reporte</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('BarcodeScanner')}>
                    <Text style={styles.buttonText}>📷 Escanear</Text>
                </TouchableOpacity>
            </View>

            {barcodeVisible && (
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <View style={{ backgroundColor: '#FFFFFF', padding: 40, borderRadius: 12 }}>
                            <Text style={{ margin: 3 }}>Código de barras</Text>
                            <Barcode
                                value={barcodeValue}
                                format="CODE128"
                                height={1010}
                                width={calcularAnchoLinea(barcodeValue)}
                                lineColor="#000"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setBarcodeVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}
// Estilos personalizados para la pantalla MaterialesScreen
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F9E5D5',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 20,
        color: '#2C3E50',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    error: {
        color: '#E74C3C',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        fontWeight: '500',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#E8F4FD',
        borderRadius: 12,
        padding: 12,
        marginBottom: 15,
        backgroundColor: '#FFFFFF',
        fontSize: 16,
        color: '#2C3E50',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    resultCount: {
        fontSize: 14,
        color: '#7F8C8D',
        textAlign: 'center',
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E8F4FD',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        flex: 1,
        marginRight: 10,
    },
    cardId: {
        fontSize: 12,
        color: '#7F8C8D',
        fontWeight: '500',
    },
    cardDetail: {
        fontSize: 14,
        color: '#7F8C8D',
        marginTop: 4,
    },
    barcodeButton: {
        marginTop: 12,
        backgroundColor: '#E38B5B',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#E38B5B',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    barcodeButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
        letterSpacing: 0.5,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 10,
    },
    pageButton: {
        backgroundColor: '#E38B5B',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 20,
        shadowColor: '#E38B5B',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 10,
    },
    pageButtonDisabled: {
        backgroundColor: '#B0B0B0',
        shadowOpacity: 0,
        elevation: 0,
        fontWeight: '600',
        fontSize: 25,
    },
    pageButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 25,
    },
    pageButtonTextDisabled: {
        color: '#CCCCCC',
        fontWeight: '600',
        fontSize: 25,
    },
    pageText: {
        fontWeight: '600',
        fontSize: 16,
        color: '#2C3E50',
    },
    navButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 10,
    },
    button: {
        backgroundColor: '#E38B5B',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 25,
        alignItems: 'center',
        flexGrow: 1,
        minWidth: '15%',
        shadowColor: '#E38B5B',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        textTransform: 'uppercase',
        fontSize: 13,
        letterSpacing: 0.5,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        alignItems: 'center',
        height: 150,
        width: 300,
    },
    closeButton: {
        marginTop: 16,
        backgroundColor: '#E38B5B',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
        elevation: 1,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 13,
    },
    materialInfo: {
        marginTop: 20,
        alignSelf: 'stretch',
    },
    label: {
        fontWeight: '600',
        marginTop: 10,
        color: '#444',
    },
    barcodeContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 160,
        minWidth: '90%',
    },
});