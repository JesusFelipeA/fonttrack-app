import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, Modal, FlatList
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { obtenerMateriales } from '../services/materiales';
import { Material } from '../types/Material';

interface MaterialSeleccionado {
    id_material: number;
    nombre: string;
    cantidad: number;
}

export default function ReporteScreen() {
    const [datos, setDatos] = useState({
        eco: '', placas: '', marca: '', ano: '', km: '', fecha: '', conductor: '',
        fallo: '', trabajo: '', quien_reporta: '', quien_revisa: '', 
        materiales: [] as MaterialSeleccionado[],
    });

    // Estados para la selección de materiales
    const [materialesDisponibles, setMaterialesDisponibles] = useState<Material[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(null);
    const [cantidadInput, setCantidadInput] = useState('');
    const [searchMaterial, setSearchMaterial] = useState('');
    const [filePath, setFilePath] = useState<string | null>(null);

    useEffect(() => {
        cargarMateriales();
    }, []);

    const cargarMateriales = async () => {
        try {
            const materiales = await obtenerMateriales();
            setMaterialesDisponibles(Array.isArray(materiales) ? materiales : []);
        } catch (error) {
            console.error('Error al cargar materiales:', error);
            Alert.alert('Error', 'No se pudieron cargar los materiales');
        }
    };

    const materialesFiltrados = materialesDisponibles.filter(material =>
        material.descripcion?.toLowerCase().includes(searchMaterial.toLowerCase()) ||
        material.clave_material?.toLowerCase().includes(searchMaterial.toLowerCase())
    );

    const seleccionarMaterial = (material: Material) => {
        setMaterialSeleccionado(material);
        setSearchMaterial('');
        setModalVisible(false);
    };

    const agregarMaterial = () => {
        if (!materialSeleccionado) {
            Alert.alert('Error', 'Debes seleccionar un material');
            return;
        }

        const cantidad = parseFloat(cantidadInput);
        if (!cantidad || cantidad <= 0) {
            Alert.alert('Error', 'Debes ingresar una cantidad válida');
            return;
        }

        // Verificar si el material ya está agregado
        const existeIndex = datos.materiales.findIndex(m => m.id_material === materialSeleccionado.id_material);
        
        if (existeIndex >= 0) {
            // Si existe, actualizar cantidad
            const nuevosMateriales = [...datos.materiales];
            nuevosMateriales[existeIndex].cantidad += cantidad;
            setDatos(prev => ({ ...prev, materiales: nuevosMateriales }));
        } else {
            // Si no existe, agregar nuevo
            const nuevoMaterial: MaterialSeleccionado = {
                id_material: materialSeleccionado.id_material,
                nombre: materialSeleccionado.descripcion || materialSeleccionado.clave_material || 'Material sin nombre',
                cantidad: cantidad
            };
            setDatos(prev => ({ ...prev, materiales: [...prev.materiales, nuevoMaterial] }));
        }

        // Limpiar campos
        setMaterialSeleccionado(null);
        setCantidadInput('');
    };

    const eliminarMaterial = (index: number) => {
        Alert.alert(
            'Eliminar Material',
            '¿Estás seguro de que quieres eliminar este material?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        const nuevosMateriales = datos.materiales.filter((_, i) => i !== index);
                        setDatos(prev => ({ ...prev, materiales: nuevosMateriales }));
                    }
                }
            ]
        );
    };

    const generarHTML = () => {
        const { eco, placas, marca, ano, km, fecha, conductor, fallo, trabajo, quien_reporta, quien_revisa, materiales } = datos;
        const materialesHtml = materiales.length
            ? materiales.map(mat => `<tr><td>${mat.nombre}</td><td>${mat.cantidad}</td></tr>`).join('')
            : '<tr><td colspan="2">No se registraron materiales</td></tr>';

        return `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><style>
            body { font-family: DejaVu Sans; font-size: 12px; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px; border: 1px solid #ccc; text-align: left; }
            th { background-color: #0066CC; color: white; }
            h1, h3 { text-align: center; margin: 15px 0; color: #2C3E50; }
            .firma { margin-top: 40px; }
            .header-table th { background-color: #0066CC; color: white; }
            .header-table td { background-color: #F8FBFF; }
        </style></head>
        <body>
            <h1>Reporte de Fallas / Uso de Materiales</h1>
            <table class="header-table">
                <tr><th>No. ECO</th><td>${eco}</td></tr>
                <tr><th>Placas</th><td>${placas}</td></tr>
                <tr><th>Marca</th><td>${marca}</td></tr>
                <tr><th>Año</th><td>${ano}</td></tr>
                <tr><th>KM</th><td>${km}</td></tr>
                <tr><th>Fecha</th><td>${fecha}</td></tr>
                <tr><th>Conductor</th><td>${conductor}</td></tr>
            </table>
            <h3>Descripción del Servicio</h3><p>${fallo}</p>
            <h3>Observaciones Técnicas</h3><p>${trabajo}</p>
            <h3>Materiales Utilizados</h3>
            <table><thead><tr><th>Material</th><th>Cantidad</th></tr></thead><tbody>${materialesHtml}</tbody></table>
            <div class="firma">
                <p><strong>Autorizado por:</strong> ${quien_reporta}</p>
                <p><strong>Revisado por:</strong> ${quien_revisa}</p>
            </div>
        </body></html>
        `;
    };

    const generarReporte = async () => {
        try {
            const file = await RNHTMLtoPDF.convert({
                html: generarHTML(),
                fileName: `reporte_fallas_materiales_${Date.now()}`,
                directory: 'Documents',
            });
            setFilePath(file.filePath || null);
            Alert.alert('✅ Reporte generado', `PDF guardado en:\n${file.filePath}`);
        } catch (error) {
            console.error(error);
            Alert.alert('❌ Error', 'No se pudo generar el PDF');
        }
    };

    const compartirReporte = async () => {
        if (!filePath) return Alert.alert('Primero debes generar el reporte');
        try {
            await Share.open({
                title: 'Compartir Reporte PDF',
                url: `file://${filePath}`,
                type: 'application/pdf',
                failOnCancel: false,
            });
        } catch (error) {
            console.error('Error al compartir:', error);
            Alert.alert('Error al compartir el archivo');
        }
    };

    const handleChange = (key: keyof typeof datos, value: string) => {
        setDatos(prev => ({ ...prev, [key]: value }));
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Generar Reporte de Materiales</Text>

            {/* Campos del formulario */}
            {(Object.entries({
                eco: 'No. ECO', placas: 'Placas', marca: 'Marca', ano: 'Año',
                km: 'KM', fecha: 'Fecha (YYYY-MM-DD)', conductor: 'Conductor',
                fallo: 'Descripción del Fallo', trabajo: 'Trabajo Realizado', 
                quien_reporta: 'Autorizado por', quien_revisa: 'Revisado por',
            }) as [keyof typeof datos, string][]).map(([key, label]) => (
                <TextInput
                    key={key}
                    placeholder={label}
                    placeholderTextColor="#7F8C8D"
                    style={key === 'fallo' || key === 'trabajo' ? styles.textArea : styles.input}
                    value={datos[key] as string}
                    onChangeText={text => handleChange(key, text)}
                    multiline={key === 'fallo' || key === 'trabajo'}
                    numberOfLines={key === 'fallo' || key === 'trabajo' ? 3 : 1}
                />
            ))}

            {/* Sección de materiales */}
            <View style={styles.materialesSection}>
                <Text style={styles.sectionTitle}>Materiales Utilizados</Text>
                
                {/* Selector de material */}
                <TouchableOpacity
                    style={styles.materialSelector}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={[styles.materialSelectorText, !materialSeleccionado && styles.placeholder]}>
                        {materialSeleccionado 
                            ? `${materialSeleccionado.clave_material} - ${materialSeleccionado.descripcion}`
                            : 'Seleccionar material...'
                        }
                    </Text>
                    <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>

                {/* Input de cantidad */}
                <TextInput
                    placeholder="Cantidad"
                    placeholderTextColor="#7F8C8D"
                    style={styles.cantidadInput}
                    value={cantidadInput}
                    onChangeText={setCantidadInput}
                    keyboardType="numeric"
                />

                <TouchableOpacity style={styles.addButton} onPress={agregarMaterial}>
                    <Text style={styles.buttonText}>➕ Agregar Material</Text>
                </TouchableOpacity>

                {/* Lista de materiales agregados */}
                {datos.materiales.length > 0 && (
                    <View style={styles.materialesLista}>
                        <Text style={styles.listaTitle}>Materiales agregados:</Text>
                        {datos.materiales.map((mat, idx) => (
                            <View key={idx} style={styles.materialItem}>
                                <View style={styles.materialInfo}>
                                    <Text style={styles.materialNombre}>{mat.nombre}</Text>
                                    <Text style={styles.materialCantidad}>Cantidad: {mat.cantidad}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => eliminarMaterial(idx)}
                                >
                                    <Text style={styles.deleteButtonText}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Botones de acción */}
            <TouchableOpacity style={styles.generateButton} onPress={generarReporte}>
                <Text style={styles.buttonText}>📄 Generar Reporte PDF</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareButton} onPress={compartirReporte}>
                <Text style={styles.buttonText}>📤 Compartir Reporte</Text>
            </TouchableOpacity>

            {/* Modal para seleccionar material */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Seleccionar Material</Text>
                        
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar material..."
                            placeholderTextColor="#7F8C8D"
                            value={searchMaterial}
                            onChangeText={setSearchMaterial}
                        />

                        <FlatList
                            data={materialesFiltrados}
                            keyExtractor={(item) => item.id_material.toString()}
                            style={styles.materialsList}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.materialOption}
                                    onPress={() => seleccionarMaterial(item)}
                                >
                                    <Text style={styles.materialClave}>{item.clave_material}</Text>
                                    <Text style={styles.materialDescripcion}>{item.descripcion}</Text>
                                    <Text style={styles.materialExistencia}>Stock: {item.existencia}</Text>
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                        />

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { 
        padding: 20, 
        backgroundColor: '#F8FBFF',
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 25,
        color: '#2C3E50',
    },
    input: {
        borderWidth: 1, 
        borderColor: '#E8F4FD',
        backgroundColor: '#FFFFFF',
        borderRadius: 12, 
        padding: 12,
        marginBottom: 15, 
        fontSize: 16,
        color: '#2C3E50',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    textArea: {
        borderWidth: 1, 
        borderColor: '#E8F4FD',
        backgroundColor: '#FFFFFF',
        borderRadius: 12, 
        padding: 12,
        marginBottom: 15, 
        fontSize: 16,
        color: '#2C3E50',
        minHeight: 80,
        textAlignVertical: 'top',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    materialesSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginVertical: 20,
        borderWidth: 1,
        borderColor: '#E8F4FD',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 15,
        textAlign: 'center',
    },
    materialSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8F4FD',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    materialSelectorText: {
        fontSize: 16,
        color: '#2C3E50',
        flex: 1,
    },
    placeholder: {
        color: '#7F8C8D',
    },
    dropdownIcon: {
        fontSize: 12,
        color: '#0066CC',
    },
    cantidadInput: {
        borderWidth: 1,
        borderColor: '#E8F4FD',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
        color: '#2C3E50',
    },
    addButton: {
        backgroundColor: '#0066CC',
        padding: 12,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    materialesLista: {
        marginTop: 20,
    },
    listaTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 10,
    },
    materialItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8FBFF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E8F4FD',
    },
    materialInfo: {
        flex: 1,
    },
    materialNombre: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C3E50',
    },
    materialCantidad: {
        fontSize: 12,
        color: '#7F8C8D',
        marginTop: 2,
    },
    deleteButton: {
        padding: 8,
    },
    deleteButtonText: {
        fontSize: 18,
    },
    generateButton: {
        backgroundColor: '#0066CC',
        padding: 16,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    shareButton: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 15,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonText: { 
        color: '#FFFFFF', 
        fontWeight: '600',
        fontSize: 16,
    },
    
    // Estilos del Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 25,
        margin: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 20,
        color: '#2C3E50',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#E8F4FD',
        backgroundColor: '#F8FBFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
        color: '#2C3E50',
    },
    materialsList: {
        maxHeight: 300,
        marginBottom: 20,
    },
    materialOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E8F4FD',
    },
    materialClave: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0066CC',
    },
    materialDescripcion: {
        fontSize: 14,
        color: '#2C3E50',
        marginTop: 2,
    },
    materialExistencia: {
        fontSize: 12,
        color: '#7F8C8D',
        marginTop: 2,
    },
    cancelButton: {
        backgroundColor: '#E74C3C',
        padding: 12,
        borderRadius: 25,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
});