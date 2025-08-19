import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, StyleSheet,
    Alert, RefreshControl, TextInput
} from 'react-native';
// Importa tu API
import api from '../api/api';


// Funciones de utilidad
// Estas funciones ayudan a manejar valores nulos o indefinidos de manera segura.
const safeString = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value);
};
// Esta función convierte una fecha a un formato legible, manejando errores de conversión.
// Si la fecha es inválida, devuelve un mensaje de error.
const safeDate = (value: any): string => {
    if (!value) return '';
    try {
        return new Date(value).toLocaleDateString();
    } catch (error) {
        return 'Fecha inválida';
    }
};

// Define las interfaces para las notificaciones y lugares
// Estas interfaces ayudan a tipar los datos que se reciben de la API, mejorando la legibilidad y seguridad del código.
interface NotificacionReal {
    id_notificacion: number;
    id_lugar: number;
    eco: string;
    placas: string;
    marca?: string;
    anio?: string;
    km?: string;
    fecha?: string;
    nombre_conductor?: string;
    descripcion: string;
    observaciones: string;
    usuario_reporta_id: number;
    nombre_usuario_reporta?: string;
    correo_usuario_reporta?: string;
    material?: string;
    cantidad?: number;
    materials?: string;
    correo_destino?: string;
    estado: 'pendiente' | 'aprobada' | 'rechazada';
    usuario_aprueba_id?: number;
    nombre_usuario_aprueba?: string;
    correo_usuario_aprueba?: string;
    autorizado_por?: string;
    reviso_por?: string;
    fecha_aprobacion?: string;
    comentarios_admin?: string;
    created_at: string;
    updated_at: string;
}

interface LugarInfo {
    id_lugar: number;
    nombre?: string;
    descripcion?: string;
}

// Pantalla principal de notificaciones
// Esta pantalla muestra una lista de notificaciones de fallas, permite buscar y refrescar la lista.
// Utiliza FlatList para renderizar las notificaciones y TextInput para la búsqueda.
export default function NotificacionesListScreen() {
    const [notificaciones, setNotificaciones] = useState<NotificacionReal[]>([]);
    const [notificacionesOriginales, setNotificacionesOriginales] = useState<NotificacionReal[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [notificacionSeleccionada, setNotificacionSeleccionada] = useState<NotificacionReal | null>(null);
    const [lugares, setLugares] = useState<LugarInfo[]>([]);

    // Cargar datos al montar el componente
    // Esta función se ejecuta una vez al cargar la pantalla para obtener las notificaciones y lugares desde la API.
    useEffect(() => {
        cargarDatos();
    }, []);

    // Función para cargar notificaciones y lugares desde la API
    // Utiliza Promise.all para hacer ambas peticiones en paralelo, mejorando el rendimiento.
    const cargarDatos = async (): Promise<void> => {
        try {
            setLoading(true);
            console.log('📋 Cargando notificaciones desde tb_notificaciones...');

            const [notificacionesResponse, lugaresResponse] = await Promise.all([
                api.get<NotificacionReal[]>('/fallas').catch(() => ({ data: [] })),
                api.get<LugarInfo[]>('/lugares').catch(() => ({ data: [] }))
            ]);

            console.log('✅ Notificaciones cargadas:', notificacionesResponse.data.length);
            console.log('✅ Lugares cargados:', lugaresResponse.data.length);

            setNotificaciones(notificacionesResponse.data);
            setNotificacionesOriginales(notificacionesResponse.data);
            setLugares(lugaresResponse.data);

        } catch (error: any) {
            console.error('❌ Error al cargar datos:', error);

            let errorMessage = 'No se pudieron cargar las notificaciones';
            if (error.response?.status === 404) {
                errorMessage = 'No hay notificaciones registradas aún';
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            Alert.alert('Error', errorMessage);
            setNotificaciones([]);
            setNotificacionesOriginales([]);
        } finally {
            setLoading(false);
        }
    };

    // Función para refrescar los datos
    // Esta función se llama al hacer pull-to-refresh en la lista, recargando las notificaciones.
    // Utiliza el estado `refreshing` para mostrar un indicador de carga mientras se actualizan los datos.
    const onRefresh = async (): Promise<void> => {
        setRefreshing(true);
        await cargarDatos();
        setRefreshing(false);
    };

    // Función para buscar notificaciones
    // Esta función filtra las notificaciones basándose en el texto ingresado en el campo de búsqueda.
    // Utiliza safeString para manejar valores nulos o indefinidos de manera segura.
    const buscarNotificaciones = (texto: string): void => {
        setBusqueda(texto);

        if (!texto.trim()) {
            setNotificaciones(notificacionesOriginales);
            return;
        }

        // Filtra las notificaciones basándose en el texto ingresado
        // Convierte el texto a minúsculas para una búsqueda insensible a mayúsculas.
        const textoLower = texto.toLowerCase();
        const notificacionesFiltradas = notificacionesOriginales.filter(notif => {
            const eco = safeString(notif.eco).toLowerCase();
            const placas = safeString(notif.placas).toLowerCase();
            const descripcion = safeString(notif.descripcion).toLowerCase();
            const marca = safeString(notif.marca).toLowerCase();
            const conductor = safeString(notif.nombre_conductor).toLowerCase();
            const material = safeString(notif.material).toLowerCase();
            const estado = safeString(notif.estado).toLowerCase();
            const usuario = safeString(notif.nombre_usuario_reporta).toLowerCase();

            // Verifica si alguno de los campos contiene el texto de búsqueda
            // Utiliza includes para verificar si el texto está presente en alguno de los campos.
            return eco.includes(textoLower) ||
                placas.includes(textoLower) ||
                descripcion.includes(textoLower) ||
                marca.includes(textoLower) ||
                conductor.includes(textoLower) ||
                material.includes(textoLower) ||
                estado.includes(textoLower) ||
                usuario.includes(textoLower);
        });

        // Actualiza el estado con las notificaciones filtradas
        // Esto actualiza la lista mostrada en la pantalla con los resultados de la búsqueda.
        setNotificaciones(notificacionesFiltradas);
        console.log(`🔍 Búsqueda: "${texto}" - ${notificacionesFiltradas.length} resultados`);
    };

    // Función para obtener el nombre del lugar por su ID
    // Esta función busca en la lista de lugares el nombre correspondiente al ID del lugar de la notificación.
    // Si no se encuentra, devuelve un mensaje indicando el ID del lugar.
    const obtenerNombreLugar = (idLugar: number): string => {
        const lugar = lugares.find(l => l.id_lugar === idLugar);
        return lugar?.nombre || `Lugar ID: ${idLugar}`;
    };

    // Función para obtener el color del estado de la notificación
    // Esta función asigna un color específico a cada estado de la notificación.
    const getEstadoColor = (estado: string): string => {
        switch (estado) {
            case 'pendiente':
                return '#F39C12'; // Naranja
            case 'aprobada':
                return '#27AE60'; // Verde
            case 'rechazada':
                return '#E74C3C'; // Rojo
            default:
                return '#7F8C8D'; // Gris
        }
    };


    // Renderiza cada item de la lista de notificaciones
    // Esta función recibe un item de tipo NotificacionReal y devuelve un componente View con la información de la notificación.
    // Utiliza estilos para mostrar la información de manera clara y organizada.
    const renderNotificacionItem = ({ item }: { item: NotificacionReal }) => {

        return (
            <View style={[styles.notificacionCard, { borderLeftColor: getEstadoColor(item.estado) }]}>
                {/* Header */}
                <View style={styles.notificacionHeader}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.notificacionId}>#{item.id_notificacion}</Text>
                        <Text style={styles.ecoText}>{item.eco}</Text>
                        <Text style={styles.placasText}>{item.placas}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.fechaText}>{safeDate(item.created_at)}</Text>
                    </View>
                </View>

                {/* Información del vehículo */}
                <View style={styles.vehiculoInfo}>
                    <Text style={styles.sectionTitle}>🚛 Vehículo</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Marca:</Text>
                        <Text style={styles.infoValue}>{item.marca || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Año:</Text>
                        <Text style={styles.infoValue}>{item.anio || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>KM:</Text>
                        <Text style={styles.infoValue}>{item.km || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Conductor:</Text>
                        <Text style={styles.infoValue}>{item.nombre_conductor || 'N/A'}</Text>
                    </View>
                </View>

                {/* Descripción */}
                <View style={styles.descripcionSection}>
                    <Text style={styles.sectionTitle}>🔧 Descripción</Text>
                    <Text style={styles.descripcionText} numberOfLines={2}>
                        {item.descripcion}
                    </Text>
                </View>

                {/* Material */}
                {item.material && (
                    <View style={styles.materialSection}>
                        <Text style={styles.materialLabel}>🔩 Material:</Text>
                        <Text style={styles.materialText}>{item.material}</Text>
                    </View>
                )}

                {/* Usuario que reporta */}
                <View style={styles.usuarioSection}>
                    <Text style={styles.usuarioLabel}>👤 Reportado por:</Text>
                    <Text style={styles.usuarioText}>
                        {item.nombre_usuario_reporta || `Usuario ID: ${item.usuario_reporta_id}`}
                    </Text>
                </View>

                {/* Lugar */}
                <View style={styles.lugarSection}>
                    <Text style={styles.lugarLabel}>🏢 Lugar:</Text>
                    <Text style={styles.lugarText}>{obtenerNombreLugar(item.id_lugar)}</Text>
                </View>

            </View>
        );
    };

    // Renderiza la pantalla principal
    // Esta función devuelve el componente principal que contiene el título, estadísticas, campo de búsqueda y la lista de notificaciones.
    // Utiliza FlatList para renderizar la lista de notificaciones y TextInput para la búsqueda.
    // También maneja el estado de carga y refresco de la lista.
    return (
        <View style={styles.container}>
            <Text style={styles.title}>📋 Notificaciones de Fallas</Text>

            {/* Estadísticas */}
            <View style={styles.estadisticas}>
                <View style={styles.estadItem}>
                    <Text style={styles.estadNumero}>{notificaciones.length}</Text>
                    <Text style={styles.estadLabel}>Total</Text>
                </View>
            </View>

            {/* Búsqueda */}
            <TextInput
                style={styles.searchInput}
                placeholder="🔍 Buscar por ECO, placas, descripción, estado..."
                placeholderTextColor="#7F8C8D"
                value={busqueda}
                onChangeText={buscarNotificaciones}
            />

            {/* Lista */}
            <FlatList
                data={notificaciones}
                keyExtractor={(item, index) => {
                    if (!item || item.id_notificacion === undefined || item.id_notificacion === null) {
                        return `key-${index}`;
                    }
                    return item.id_notificacion.toString();
                }}
                renderItem={renderNotificacionItem}
                contentContainerStyle={styles.listaContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#0066CC']}
                    />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>📋 No hay notificaciones</Text>
                        <Text style={styles.emptySubtitle}>
                            {loading ? 'Cargando...' : 'Las notificaciones de fallas aparecerán aquí'}
                        </Text>
                    </View>
                )}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

// Cuenta con estilos para la pantalla
// Estos estilos definen la apariencia de los componentes en la pantalla, utilizando colores y tamaños específicos
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9E5D5',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 20,
        color: '#634D3B',
    },
    estadisticas: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#C49A6C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    estadItem: {
        alignItems: 'center',
    },
    estadNumero: {
        fontSize: 20,
        fontWeight: '700',
        color: '#E38B5B',
    },
    estadLabel: {
        fontSize: 10,
        color: '#7F8C8D',
        marginTop: 2,
    },
    searchInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        fontSize: 14,
        color: '#634D3B',
        borderWidth: 1,
        borderColor: '#F6B88F',
    },
    listaContainer: {
        paddingBottom: 20,
    },
    notificacionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        borderLeftWidth: 4,
        shadowColor: '#C49A6C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    notificacionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F6B88F',
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    notificacionId: {
        fontSize: 12,
        color: '#7F8C8D',
        fontWeight: '600',
    },
    ecoText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#634D3B',
        marginTop: 2,
    },
    placasText: {
        fontSize: 14,
        color: '#E38B5B',
        fontWeight: '600',
        marginTop: 2,
    },
    estadoText: {
        fontSize: 12,
        fontWeight: '700',
    },
    fechaText: {
        fontSize: 10,
        color: '#7F8C8D',
        marginTop: 2,
    },
    vehiculoInfo: {
        marginBottom: 10,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#634D3B',
        marginBottom: 6,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 3,
    },
    infoLabel: {
        fontSize: 11,
        color: '#7F8C8D',
        flex: 1,
    },
    infoValue: {
        fontSize: 11,
        color: '#634D3B',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    descripcionSection: {
        marginBottom: 10,
    },
    descripcionText: {
        fontSize: 12,
        color: '#34495E',
        lineHeight: 16,
    },
    materialSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#FFF3E0',
        borderRadius: 6,
        padding: 8,
    },
    materialLabel: {
        fontSize: 11,
        color: '#7F8C8D',
        marginRight: 8,
    },
    materialText: {
        fontSize: 11,
        color: '#E67E22',
        fontWeight: '500',
        flex: 1,
    },
    usuarioSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    usuarioLabel: {
        fontSize: 11,
        color: '#7F8C8D',
        marginRight: 8,
    },
    usuarioText: {
        fontSize: 11,
        color: '#34495E',
        fontWeight: '500',
        flex: 1,
    },
    lugarSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    lugarLabel: {
        fontSize: 11,
        color: '#7F8C8D',
        marginRight: 8,
    },
    lugarText: {
        fontSize: 11,
        color: '#27AE60',
        fontWeight: '500',
        flex: 1,
    },
    botonesAccion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    verDetalleBtn: {
        backgroundColor: '#3498DB',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        marginHorizontal: 2,
        alignItems: 'center',
        flex: 1,
    },
    aprobarBtn: {
        backgroundColor: '#27AE60',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        marginHorizontal: 2,
        alignItems: 'center',
        flex: 1,
    },
    rechazarBtn: {
        backgroundColor: '#E74C3C',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        marginHorizontal: 2,
        alignItems: 'center',
        flex: 1,
    },
    eliminarBtn: {
        backgroundColor: '#95A5A6',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 15,
        marginHorizontal: 2,
        alignItems: 'center',
    },
    btnText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 10,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#7F8C8D',
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#BDC3C7',
        textAlign: 'center',
        marginTop: 8,
    },
});