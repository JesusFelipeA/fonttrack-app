import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, Modal, FlatList
} from 'react-native';
// Importar librerías necesarias
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { obtenerMateriales } from '../services/materiales';
import { Material } from '../types/Material';
import api from '../api/api';

// Definir interfaces para los tipos de datos utilizados.
interface MaterialSeleccionado {
    id_material: number;
    nombre: string;
    cantidad: number;
}

// Definir la interfaz para los datos del formulario.
interface DatosFormulario {
    eco: string;
    placas: string;
    marca: string;
    ano: string;
    km: string;
    fecha: string;
    nombre_conductor: string;
    descripcion: string;
    observaciones: string;
    reviso_por: string;
    autorizado_por: string;
    id_lugar: string;
    materials: MaterialSeleccionado[];
    material: string;
}
// Definir la interfaz para la respuesta del lugar.
interface LugarResponse {
    id_lugar: number;
    nombre?: string;
    descripcion?: string;
}
// Definir la interfaz para la respuesta de notificación.
interface NotificacionResponse {
    message: string;
    id_notificacion: number;
    tipo: string;
    data: {
        id_notificacion: number;
        titulo: string;
        eco: string;
        placas: string;
        usuario_reporta_id: number;
        fecha_envio: string;
        [key: string]: any;
    };
}


export default function ReporteScreen() {
    // Estado para manejar los datos del formulario.
    // Incluye campos para ECO, placas, marca, año, km, fecha, conductor, descripción, observaciones, reviso por, autorizado por, lugar y materiales.
    // También incluye un array de materiales seleccionados.
    const [datos, setDatos] = useState<DatosFormulario>({
        eco: '', placas: '', marca: '', ano: '', km: '', fecha: '', nombre_conductor: '',
        descripcion: '', observaciones: '', reviso_por: '', autorizado_por: '',
        id_lugar: '', material: '', materials: [],
    });
    // Estado para manejar los materiales disponibles, modal de selección y otros estados.
    const [materialesDisponibles, setMaterialesDisponibles] = useState<Material[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(null);
    const [cantidadInput, setCantidadInput] = useState('');
    const [searchMaterial, setSearchMaterial] = useState('');
    const [filePath, setFilePath] = useState<string | null>(null);
    const [lugaresDisponibles, setLugaresDisponibles] = useState<LugarResponse[]>([]);
    const [modalLugarVisible, setModalLugarVisible] = useState(false);

    // Cargar materiales y lugares al iniciar el componente.
    // Utiliza useEffect para llamar a las funciones de carga al montar el componente.
    useEffect(() => {
        cargarMateriales();
        cargarLugares();
    }, []);

    // Funciones para validar el formato de fecha, convertirla a MySQL y obtener el tipo de formato.
    // Estas funciones aseguran que las fechas ingresadas sean válidas y estén en el formato correcto.
    // También manejan la conversión entre formatos DD/MM/YYYY y YYYY/MM/DD.
    const validarFormatoFecha = (fecha: string): boolean => {
        const regexDDMMYYYY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        const regexYYYYMMDD = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;

        const matchDD = fecha.match(regexDDMMYYYY);
        const matchYYYY = fecha.match(regexYYYYMMDD);

        if (matchDD) {
            const dia = parseInt(matchDD[1]);
            const mes = parseInt(matchDD[2]);
            const año = parseInt(matchDD[3]);

            if (mes < 1 || mes > 12) return false;
            if (dia < 1 || dia > 31) return false;
            if (año < 2020 || año > new Date().getFullYear() + 1) return false;

            return true;
        } else if (matchYYYY) {
            const año = parseInt(matchYYYY[1]);
            const mes = parseInt(matchYYYY[2]);
            const dia = parseInt(matchYYYY[3]);

            if (mes < 1 || mes > 12) return false;
            if (dia < 1 || dia > 31) return false;
            if (año < 2020 || año > new Date().getFullYear() + 1) return false;

            return true;
        }

        return false;
    };

    // Función para convertir la fecha al formato MySQL (YYYY-MM-DD).
    const convertirFechaMySQL = (fechaInput: string): string | null => {
        if (!validarFormatoFecha(fechaInput)) return null;

        const regexDDMMYYYY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        const regexYYYYMMDD = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;

        const matchDD = fechaInput.match(regexDDMMYYYY);
        const matchYYYY = fechaInput.match(regexYYYYMMDD);

        if (matchDD) {
            const dia = matchDD[1].padStart(2, '0');
            const mes = matchDD[2].padStart(2, '0');
            const año = matchDD[3];
            return `${año}-${mes}-${dia}`;
        } else if (matchYYYY) {
            const año = matchYYYY[1];
            const mes = matchYYYY[2].padStart(2, '0');
            const dia = matchYYYY[3].padStart(2, '0');
            return `${año}-${mes}-${dia}`;
        }

        return null;
    };

    // Función para obtener el tipo de formato de fecha ingresada.
    const obtenerTipoFormato = (fecha: string): string => {
        const regexDDMMYYYY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        const regexYYYYMMDD = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;

        if (regexDDMMYYYY.test(fecha)) {
            return 'DD/MM/YYYY';
        } else if (regexYYYYMMDD.test(fecha)) {
            return 'YYYY/MM/DD';
        }

        return 'Formato no válido';
    };

    // Función para manejar el cambio de fecha en el campo de entrada.
    const manejarCambioFecha = (texto: string): void => {
        const textoLimpio = texto.replace(/[^0-9\/]/g, '');

        setDatos(prev => ({ ...prev, fecha: textoLimpio }));
    };

    // Función para cargar los materiales disponibles desde el servicio.
    const cargarMateriales = async (): Promise<void> => {
        try {
            const materiales = await obtenerMateriales();
            setMaterialesDisponibles(Array.isArray(materiales) ? materiales : []);
        } catch (error) {
            console.error('Error al cargar materiales:', error);
            Alert.alert('Error', 'No se pudieron cargar los materiales');
        }
    };

    // Función para cargar los lugares disponibles desde la API.
    const cargarLugares = async (): Promise<void> => {
        try {
            console.log('🏢 Cargando lugares disponibles...');

            const response = await api.get<LugarResponse[]>('/lugares');

            console.log('📋 Lugares cargados:', response.data);

            setLugaresDisponibles(response.data);

            if (response.data.length > 0 && !datos.id_lugar) {
                setDatos(prev => ({ ...prev, id_lugar: response.data[0].id_lugar.toString() }));
            }

        } catch (error: any) {
            console.error('❌ Error al cargar lugares:', error);

            Alert.alert(
                '⚠️ Error al cargar lugares',
                'No se pudieron cargar los lugares disponibles.\n\n' +
                '¿La tabla tb_lugares existe y tiene datos?\n\n' +
                'Puedes usar "Ver Lugares Disponibles" para verificar.',
                [
                    {
                        text: 'Ver Lugares',
                        onPress: () => verLugaresDisponibles()
                    },
                    {
                        text: 'Continuar sin lugar',
                        style: 'default'
                    }
                ]
            );
        }
    };

    // Filtrar los materiales disponibles según la búsqueda del usuario.
    const materialesFiltrados = materialesDisponibles.filter(material =>
        material.descripcion?.toLowerCase().includes(searchMaterial.toLowerCase()) ||
        material.clave_material?.toLowerCase().includes(searchMaterial.toLowerCase())
    );

    // Función para seleccionar un material de la lista filtrada.
    const seleccionarMaterial = (material: Material): void => {
        setMaterialSeleccionado(material);

        const nombreMaterial = material.descripcion || material.clave_material || 'Material sin nombre';
        setDatos(prev => ({ ...prev, material: nombreMaterial }));

        // Limpiar el campo de búsqueda y cerrar el modal.
        setSearchMaterial('');
        setModalVisible(false);

        console.log('✅ Material seleccionado:', {
            id: material.id_material,
            nombre: nombreMaterial,
            clave: material.clave_material
        });
    };

    // Función para mostrar el modal de selección de material.
    const seleccionarLugar = (lugar: LugarResponse): void => {
        setDatos(prev => ({ ...prev, id_lugar: lugar.id_lugar.toString() }));
        setModalLugarVisible(false);

        console.log('🏢 Lugar seleccionado:', lugar);

        Alert.alert(
            '✅ Lugar Seleccionado',
            `Has seleccionado:\n\n` +
            `ID: ${lugar.id_lugar}\n` +
            `Nombre: ${lugar.nombre || 'Sin nombre'}\n` +
            `Descripción: ${lugar.descripcion || 'Sin descripción'}`,
            [{ text: 'OK' }]
        );
    };

    // Función para obtener el lugar seleccionado basado en el ID almacenado en los datos del formulario.
    const obtenerLugarSeleccionado = (): LugarResponse | null => {
        if (!datos.id_lugar) return null;

        const lugarEncontrado = lugaresDisponibles.find(
            lugar => lugar.id_lugar.toString() === datos.id_lugar
        );

        return lugarEncontrado || null;
    };

    // Función para agregar un material seleccionado al formulario.
    const agregarMaterial = (): void => {
        if (!materialSeleccionado) {
            Alert.alert('Error', 'Debes seleccionar un material');
            return;
        }

        const cantidad = parseFloat(cantidadInput);
        if (!cantidad || cantidad <= 0) {
            Alert.alert('Error', 'Debes ingresar una cantidad válida');
            return;
        }

        // Verificar si el material ya existe en la lista de materiales.
        const nombreCompleto = materialSeleccionado.descripcion || materialSeleccionado.clave_material || 'Material sin nombre';

        const existeIndex = datos.materials.findIndex(m => m.id_material === materialSeleccionado.id_material);

        if (existeIndex >= 0) {
            const nuevosMateriales = [...datos.materials];
            nuevosMateriales[existeIndex].cantidad += cantidad;
            setDatos(prev => ({ ...prev, materials: nuevosMateriales }));

            console.log('✅ Cantidad actualizada para:', nombreCompleto, 'Nueva cantidad:', nuevosMateriales[existeIndex].cantidad);
        } else {

            // Si el material no existe, agregarlo como un nuevo material seleccionado.
            const nuevoMaterial: MaterialSeleccionado = {
                id_material: materialSeleccionado.id_material,
                nombre: nombreCompleto,
                cantidad: cantidad
            };
            setDatos(prev => ({ ...prev, materials: [...prev.materials, nuevoMaterial] }));

            console.log('✅ Material agregado:', nuevoMaterial);
        }

        // Limpiar el campo de cantidad y el material seleccionado.
        setMaterialSeleccionado(null);
        setCantidadInput('');
        setDatos(prev => ({ ...prev, material: '' }));

        Alert.alert(
            '✅ Material Agregado',
            `${nombreCompleto}\nCantidad: ${cantidad}`,
            [{ text: 'OK' }]
        );
    };

    // Función para ver los lugares disponibles.
    const verLugaresDisponibles = async (): Promise<void> => {
        try {
            console.log('🏢 Obteniendo lugares disponibles...');

            const response = await api.get<LugarResponse[]>('/lugares');

            console.log('📋 Lugares disponibles:', response.data);

            if (response.data.length === 0) {
                Alert.alert(
                    '❌ No hay lugares',
                    'No hay lugares disponibles en tb_lugares.\n\n' +
                    'Debes crear al menos un lugar primero.\n\n' +
                    'Ejecuta este SQL:\n' +
                    "INSERT INTO tb_lugares (nombre, descripcion) VALUES ('Taller Principal', 'Taller de mantenimiento');",
                    [{ text: 'OK' }]
                );
                return;
            }

            // Mostrar los lugares disponibles en un alert.
            const lugaresTexto = response.data
                .map((lugar: LugarResponse) => `ID: ${lugar.id_lugar} - ${lugar.nombre || lugar.descripcion || 'Sin nombre'}`)
                .join('\n');

            Alert.alert(
                '🏢 Lugares Disponibles',
                `Se encontraron ${response.data.length} lugares:\n\n${lugaresTexto}\n\n` +
                `El sistema permite seleccionar cualquiera de estos lugares.`,
                [{ text: 'OK' }]
            );

        } catch (error: any) {
            console.error('❌ Error al obtener lugares:', error);

            let errorMessage = 'No se pudieron obtener los lugares';
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            Alert.alert(
                '❌ Error',
                errorMessage + '\n\n¿La tabla tb_lugares existe?\n\n' +
                'Ejecuta este SQL para crearla:\n' +
                'CREATE TABLE tb_lugares (id_lugar INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(100), descripcion TEXT);',
                [{ text: 'OK' }]
            );
        }
    };

    // Función para guardar la falla como una notificación.
    const guardarFalla = async (): Promise<void> => {
        try {
            console.log('🔍 DEBUG: Estado actual de datos:', datos);

            if (!datos.eco || !datos.placas || !datos.descripcion || !datos.observaciones || !datos.id_lugar) {
                console.log('❌ VALIDACIÓN FALLIDA:');
                console.log('eco:', datos.eco ? '✅' : '❌ VACÍO');
                console.log('placas:', datos.placas ? '✅' : '❌ VACÍO');
                console.log('descripcion:', datos.descripcion ? '✅' : '❌ VACÍO');
                console.log('observaciones:', datos.observaciones ? '✅' : '❌ VACÍO');
                console.log('id_lugar:', datos.id_lugar ? '✅' : '❌ VACÍO');

                Alert.alert('Campos Requeridos',
                    'Por favor completa estos campos básicos:\n\n' +
                    `• ECO: ${datos.eco ? '✅' : '❌'}\n` +
                    `• Placas: ${datos.placas ? '✅' : '❌'}\n` +
                    `• Descripción del Fallo: ${datos.descripcion ? '✅' : '❌'}\n` +
                    `• Observaciones/Trabajo: ${datos.observaciones ? '✅' : '❌'}\n` +
                    `• Lugar: ${datos.id_lugar ? '✅' : '❌'}`
                );
                return;
            }

            // Validar formato de fecha si se ha ingresado.
            if (datos.fecha && !validarFormatoFecha(datos.fecha)) {
                const formatoDetectado = obtenerTipoFormato(datos.fecha);
                Alert.alert(
                    '❌ Fecha Inválida',
                    `Formato detectado: ${formatoDetectado}\n\n` +
                    'Formatos válidos:\n' +
                    '• DD/MM/YYYY (ej: 12/08/2025)\n' +
                    '• YYYY/MM/DD (ej: 2025/08/12)',
                    [
                        {
                            text: 'Corregir Manualmente',
                            style: 'default'
                        }
                    ]
                );
                return;
            }

            // Validar que se haya seleccionado un lugar.
            const lugarSeleccionado = obtenerLugarSeleccionado();
            if (!lugarSeleccionado) {
                Alert.alert(
                    '❌ Lugar Inválido',
                    'El lugar seleccionado no es válido.\n\nPor favor selecciona un lugar de la lista.',
                    [
                        {
                            text: 'Seleccionar Lugar',
                            onPress: () => setModalLugarVisible(true)
                        },
                        {
                            text: 'Recargar Lugares',
                            onPress: () => cargarLugares()
                        }
                    ]
                );
                return;
            }

            let materialPrincipal = null;

            if (datos.material && datos.material.trim()) {
                materialPrincipal = datos.material.trim();
            } else if (datos.materials && datos.materials.length > 0) {
                materialPrincipal = datos.materials[0].nombre;
            } else {
                materialPrincipal = 'No especificado';
            }

            console.log('🔧 Material principal determinado:', materialPrincipal);

            let fechaParaEnviar = null;
            if (datos.fecha) {
                fechaParaEnviar = convertirFechaMySQL(datos.fecha);
                if (!fechaParaEnviar) {
                    Alert.alert('❌ Error de Fecha', 'No se pudo convertir la fecha al formato requerido');
                    return;
                }
                console.log('📅 Conversión de fecha:', {
                    original: datos.fecha,
                    formato: obtenerTipoFormato(datos.fecha),
                    mysql: fechaParaEnviar
                });
            }

            // Preparar los datos de la notificación de falla.
            const notificacionFalla = {
                eco: datos.eco.trim(),
                placas: datos.placas.trim().toUpperCase(),
                descripcion: datos.descripcion.trim(),
                observaciones: datos.observaciones.trim(),
                id_lugar: parseInt(datos.id_lugar),
                material: materialPrincipal,
                marca: datos.marca?.trim() || null,
                anio: datos.ano?.trim() || null,
                km: datos.km?.trim() || null,
                fecha: fechaParaEnviar, // 🆕 Fecha convertida a formato MySQL
                nombre_conductor: datos.nombre_conductor?.trim() || null,
                reviso_por: datos.reviso_por?.trim() || null,
                autorizado_por: datos.autorizado_por?.trim() || null,
                materials: datos.materials.length > 0 ? datos.materials : null,
                cantidad: datos.materials.length
            };

            console.log('📤 Enviando datos para crear notificación de falla:', notificacionFalla);
            console.log('🏢 Lugar seleccionado:', lugarSeleccionado);
            console.log('🔧 Material principal:', notificacionFalla.material);
            console.log('📅 Fecha original:', datos.fecha);
            console.log('📅 Fecha para MySQL:', fechaParaEnviar);

            // Confirmación antes de enviar la notificación.
            Alert.alert(
                'Creando Notificación...',
                `Registrando falla como notificación\n\n` +
                `ECO: ${notificacionFalla.eco}\n` +
                `Placas: ${notificacionFalla.placas}\n` +
                `Marca: ${notificacionFalla.marca || 'No especificada'}\n` +
                `Año: ${notificacionFalla.anio || 'No especificado'}\n` +
                `Fecha: ${datos.fecha || 'No especificada'}\n` +
                `Lugar: ${lugarSeleccionado.nombre || `ID: ${lugarSeleccionado.id_lugar}`}\n` +
                `Material Principal: ${notificacionFalla.material}\n` +
                `Total Materiales: ${notificacionFalla.cantidad} item(s)`
            );

            const response = await api.post<NotificacionResponse>('/fallas', notificacionFalla);

            console.log('✅ Respuesta del servidor (notificación):', response.data);

            // Mostrar alerta de éxito con los detalles de la notificación creada.
            Alert.alert(
                '✅ ¡Notificación de Falla Creada!',
                `Se ha registrado correctamente como notificación:\n\n` +
                `📋 ID Notificación: ${response.data.id_notificacion}\n` +
                `📋 Tipo: ${response.data.tipo}\n` +
                `🚛 ECO: ${notificacionFalla.eco}\n` +
                `🏷️ Placas: ${notificacionFalla.placas}\n` +
                `🚗 Marca: ${notificacionFalla.marca || 'No especificada'}\n` +
                `🗓️ Año: ${notificacionFalla.anio || 'No especificado'}\n` +
                `📅 Fecha: ${datos.fecha || 'No especificada'}\n` +
                `🏢 Lugar: ${lugarSeleccionado.nombre || `ID: ${lugarSeleccionado.id_lugar}`}\n` +
                `🔩 Material: ${notificacionFalla.material}\n` +
                `🔧 Total Materiales: ${notificacionFalla.cantidad}\n` +
                `👤 Revisado por: ${notificacionFalla.reviso_por || 'No especificado'}\n` +
                `🔍 Autorizado por: ${notificacionFalla.autorizado_por || 'No especificado'}`,
                [
                    {
                        text: 'Nueva Falla',
                        onPress: () => limpiarFormulario()
                    },
                    {
                        text: 'Continuar',
                        style: 'default'
                    }
                ]
            );

        } catch (error: any) {
            console.error('❌ Error completo:', error);

            let errorMessage = 'No se pudo crear la notificación de falla';

            if (error.response) {
                console.log('❌ Error response:', error.response.data);
                console.log('❌ Status:', error.response.status);

                if (error.response.status === 400) {
                    errorMessage = `Datos inválidos: ${error.response.data.error}`;
                } else if (error.response.status === 500) {
                    errorMessage = `Error del servidor: ${error.response.data.mensaje || error.response.data.error}`;

                    if (error.response.data.codigo === 'ER_NO_REFERENCED_ROW_2') {
                        errorMessage += '\n\n💡 Posible solución: Ejecuta el script SQL para crear usuario de sistema';
                    }
                }
            } else if (error.message) {
                errorMessage = `Error de conexión: ${error.message}`;
            }

            Alert.alert('❌ Error al Crear Notificación', errorMessage, [
                {
                    text: 'Verificar Lugar',
                    onPress: () => setModalLugarVisible(true)
                },
                {
                    text: 'OK',
                    style: 'default'
                }
            ]);
        }
    };

    // Función para eliminar un material de la lista de materiales.
    const eliminarMaterial = (index: number): void => {
        const materialAEliminar = datos.materials[index];

        Alert.alert(
            'Eliminar Material',
            `¿Estás seguro de que quieres eliminar:\n\n${materialAEliminar?.nombre}\nCantidad: ${materialAEliminar?.cantidad}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        const nuevosMateriales = datos.materials.filter((_, i) => i !== index);
                        setDatos(prev => ({ ...prev, materials: nuevosMateriales }));

                        console.log(`🗑️ Material eliminado: ${materialAEliminar?.nombre}`);
                        console.log(`📋 Materiales restantes: ${nuevosMateriales.length}`);
                    }
                }
            ]
        );
    };

    // Función para generar el HTML del reporte.
    const generarHTML = (): string => {
        const { eco, placas, marca, ano, km, fecha, nombre_conductor, descripcion, observaciones, reviso_por, autorizado_por, materials } = datos;

        const lugarInfo = obtenerLugarSeleccionado();
        const lugarTexto = lugarInfo ? `${lugarInfo.nombre || `ID: ${lugarInfo.id_lugar}`}` : 'No especificado';

        const materialesHtml = materials.length
            ? materials.map(mat => `<tr><td>${mat.nombre}</td><td>${mat.cantidad}</td></tr>`).join('')
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
                <tr><th>No. ECO</th><td>${eco || 'N/A'}</td></tr>
                <tr><th>Placas</th><td>${placas || 'N/A'}</td></tr>
                <tr><th>Marca</th><td>${marca || 'N/A'}</td></tr>
                <tr><th>Año</th><td>${ano || 'N/A'}</td></tr>
                <tr><th>KM</th><td>${km || 'N/A'}</td></tr>
                <tr><th>Fecha</th><td>${fecha || 'N/A'}</td></tr>
                <tr><th>Conductor</th><td>${nombre_conductor || 'N/A'}</td></tr>
                <tr><th>Lugar</th><td>${lugarTexto}</td></tr>
            </table>
            <h3>Descripción del Servicio</h3>
            <p>${descripcion || 'Sin descripción'}</p>
            <h3>Observaciones Técnicas</h3>
            <p>${observaciones || 'Sin observaciones'}</p>
            <h3>Materiales Utilizados</h3>
            <table><thead><tr><th>Material</th><th>Cantidad</th></tr></thead><tbody>${materialesHtml}</tbody></table>
            <div class="firma">
                <p><strong>Autorizado por:</strong> ${autorizado_por || 'N/A'}</p>
                <p><strong>Revisado por:</strong> ${reviso_por || 'N/A'}</p>
            </div>
        </body></html>
        `;
    };

    // Función para limpiar el formulario y restablecer los estados.
    // Resetea todos los campos del formulario a sus valores iniciales.
    const limpiarFormulario = (): void => {
        const primerLugar = lugaresDisponibles.length > 0 ? lugaresDisponibles[0].id_lugar.toString() : '';

        setDatos({
            eco: '',
            placas: '',
            marca: '',
            ano: '',
            km: '',
            fecha: '',
            nombre_conductor: '',
            descripcion: '',
            observaciones: '',
            material: '',
            reviso_por: '',
            autorizado_por: '',
            id_lugar: primerLugar,
            materials: [],
        });
        setMaterialSeleccionado(null);
        setCantidadInput('');
        setFilePath(null);

        console.log(`🧹 Formulario limpiado. Lugar seleccionado: ${primerLugar || 'Ninguno'}`);
    };
    // Función para validar los campos mínimos requeridos antes de generar el reporte.
    // Asegura que al menos los campos ECO, Placas y Autorizado por estén completos.
    // Si no se cumplen, muestra una alerta y retorna false.
    const validarCamposMinimos = (): boolean => {
        if (!datos.eco || !datos.placas || !datos.reviso_por) {
            Alert.alert('Campos Requeridos', 'Por favor completa al menos: ECO, Placas y Autorizado por');
            return false;
        }
        return true;
    };
    // Función para generar el reporte en PDF.
    // Utiliza RNHTMLtoPDF para convertir el HTML generado en un archivo PDF.
    const generarReporte = async (): Promise<void> => {
        try {

            if (!validarCamposMinimos()) {
                return;
            }

            const file = await RNHTMLtoPDF.convert({
                html: generarHTML(),
                fileName: `reporte_fallas_materiales_${Date.now()}`,
                directory: 'Documents',
            });
            setFilePath(file.filePath || null);
            Alert.alert('✅ Reporte generado', `PDF guardado en:\n${file.filePath}`);
        } catch (error) {
            console.error('Error al generar reporte:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            Alert.alert('❌ Error', `No se pudo generar el PDF: ${errorMessage}`);
        }
    };
    // Función para compartir el reporte PDF generado.
    // Utiliza la librería react-native-share para abrir el diálogo de compartir.
    const compartirReporte = async (): Promise<void> => {
        if (!filePath) {
            Alert.alert('Error', 'Primero debes generar el reporte');
            return;
        }

        try {
            await Share.open({
                title: 'Compartir Reporte PDF',
                url: `file://${filePath}`,
                type: 'application/pdf',
                failOnCancel: false,
            });
        } catch (error) {
            console.error('Error al compartir:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            Alert.alert('Error al compartir el archivo', errorMessage);
        }
    };
    // Función para manejar el cambio de texto en los campos del formulario.
    // Actualiza el estado de los datos del formulario según el campo modificado.
    const handleChange = (key: keyof DatosFormulario, value: string): void => {
        if (key === 'materials') {
            return;
        }
        if (key === 'fecha') {
            manejarCambioFecha(value);
            return;
        }
        // Actualizar el estado de los datos del formulario para el campo modificado.
        // Utiliza la función setDatos para mantener la inmutabilidad del estado.
        setDatos(prev => ({
            ...prev,
            [key]: value
        }));
    };
    // Renderizar el componente principal de la pantalla de reporte.
    // Incluye campos de entrada para ECO, placas, marca, año, km, fecha, conductor, descripción, observaciones, reviso por, autorizado por, lugar y materiales.
    // Utiliza ScrollView para permitir el desplazamiento en caso de que el contenido sea extenso.
    // Incluye botones para generar el reporte y compartirlo, así como para limpiar el formulario
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Generar Reporte de Materiales</Text>

            {(Object.entries({
                eco: 'No. ECO *',
                placas: 'Placas *',
                marca: 'Marca',
                ano: 'Año',
                km: 'KM',
                fecha: 'Fecha',
                nombre_conductor: 'Conductor',
            }) as [keyof DatosFormulario, string][]).map(([key, label]) => (
                <TextInput
                    key={key}
                    placeholder={label}
                    placeholderTextColor="#7F8C8D"
                    style={[
                        styles.input,
                        key === 'fecha' && datos.fecha && !validarFormatoFecha(datos.fecha) && styles.fechaInputError,
                        key === 'fecha' && datos.fecha && validarFormatoFecha(datos.fecha) && styles.fechaInputValid
                    ]}
                    value={datos[key] as string}
                    onChangeText={text => handleChange(key, text)}
                />
            ))}

            {/* Campos de descripción */}
            {(Object.entries({
                descripcion: 'Descripción del Fallo *',
                observaciones: 'Trabajo Realizado *',
                reviso_por: 'Autorizado por *',
                autorizado_por: 'Revisado por',
            }) as [keyof DatosFormulario, string][]).map(([key, label]) => (
                <TextInput
                    key={key}
                    placeholder={label}
                    placeholderTextColor="#7F8C8D"
                    style={key === 'descripcion' || key === 'observaciones' ? styles.textArea : styles.input}
                    value={datos[key] as string}
                    onChangeText={text => handleChange(key, text)}
                    multiline={key === 'descripcion' || key === 'observaciones'}
                    numberOfLines={key === 'descripcion' || key === 'observaciones' ? 3 : 1}
                />
            ))}

            <View style={styles.lugarSection}>
                {/* Mostrar el lugar seleccionado si existe */}
                <Text style={styles.lugarTitle}>📍 Seleccionar Lugar *</Text>
                <TouchableOpacity
                    style={[styles.lugarSelector, !datos.id_lugar && styles.lugarSelectorError]}
                    onPress={() => setModalLugarVisible(true)}
                >
                    <Text style={[styles.lugarSelectorText, !datos.id_lugar && styles.placeholder]}>
                        {datos.id_lugar ? (
                            (() => {
                                const lugar = obtenerLugarSeleccionado();
                                return lugar
                                    ? `🏢 ${lugar.nombre || `Lugar ID: ${lugar.id_lugar}`}`
                                    : `ID: ${datos.id_lugar} (No encontrado)`;
                            })()
                        ) : 'Seleccionar lugar...'}
                    </Text>
                    <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>

                {lugaresDisponibles.length === 0 && (
                    <TouchableOpacity
                        style={styles.recargarButton}
                        onPress={cargarLugares}
                    >
                        <Text style={styles.recargarButtonText}>🔄 Recargar Lugares</Text>
                    </TouchableOpacity>
                )}
            </View>
                
            <View style={styles.materialesSection}>
                {/* Mostrar el material seleccionado */}
                <Text style={styles.sectionTitle}>Materiales Utilizados</Text>

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

                {datos.material && (
                    <View style={styles.materialSeleccionadoContainer}>
                        <Text style={styles.materialSeleccionadoLabel}>Material seleccionado:</Text>
                        <Text style={styles.materialSeleccionadoTexto}>{datos.material}</Text>
                    </View>
                )}

                <TextInput
                    placeholder="Cantidad"
                    placeholderTextColor="#7F8C8D"
                    style={styles.cantidadInput}
                    value={cantidadInput}
                    onChangeText={setCantidadInput}
                    keyboardType="numeric"
                />
                {/* Botón para agregar el material seleccionado con la cantidad especificada */}
                <TouchableOpacity style={styles.addButton} onPress={agregarMaterial}>
                    <Text style={styles.buttonText}>➕ Agregar Material</Text>
                </TouchableOpacity>
                {/* Mostrar la lista de materiales agregados */}
                {/* Si hay materiales, mostrar la lista con opciones para eliminar cada uno */}
                {datos.materials.length > 0 && (
                    <View style={styles.materialesLista}>
                        <Text style={styles.listaTitle}>Materiales agregados: ({datos.materials.length})</Text>
                        {datos.materials.map((mat, idx) => (
                            <View key={idx} style={styles.materialItem}>
                                <View style={styles.materialInfo}>
                                    <Text style={styles.materialNombre}>{mat.nombre}</Text>
                                    <Text style={styles.materialCantidad}>Cantidad: {mat.cantidad}</Text>
                                    <Text style={styles.materialId}>ID: {mat.id_material}</Text>
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
                {/* Botones de acción para guardar, limpiar y generar reporte */}
            <View style={styles.actionButtonsContainer}>

                <TouchableOpacity style={styles.saveButton} onPress={guardarFalla}>
                    <Text style={styles.buttonText}>💾 Guardar Falla Completa</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.clearButton} onPress={limpiarFormulario}>
                    <Text style={styles.buttonText}>🗑️ Limpiar Formulario</Text>
                </TouchableOpacity>

                <View style={styles.separator} />
                <Text style={styles.separatorText}>Generar Reporte PDF</Text>

                <TouchableOpacity style={styles.generateButton} onPress={generarReporte}>
                    <Text style={styles.buttonText}>📄 Generar Reporte PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareButton} onPress={compartirReporte}>
                    <Text style={styles.buttonText}>📤 Compartir Reporte</Text>
                </TouchableOpacity>
            </View>

            {/* Modal para seleccionar el material que se vaya a ocupar, con su respectivo filtro de busqueda */}
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

            {/* Modal para seleccionar el lugar donde se va a realizar la falla */ }
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalLugarVisible}
                onRequestClose={() => setModalLugarVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>📍 Seleccionar Lugar</Text>

                        {lugaresDisponibles.length === 0 ? (
                            <View style={styles.noLugaresContainer}>
                                <Text style={styles.noLugaresText}>
                                    No hay lugares disponibles
                                </Text>
                                <TouchableOpacity
                                    style={styles.recargarButton}
                                    onPress={() => {
                                        cargarLugares();
                                        setModalLugarVisible(false);
                                    }}
                                >
                                    <Text style={styles.recargarButtonText}>🔄 Recargar Lugares</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.verLugaresButton}
                                    onPress={() => {
                                        setModalLugarVisible(false);
                                        verLugaresDisponibles();
                                    }}
                                >
                                    <Text style={styles.verLugaresButtonText}>🏢 Ver Lugares en BD</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <FlatList
                                data={lugaresDisponibles}
                                keyExtractor={(item) => item.id_lugar.toString()}
                                style={styles.lugaresList}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.lugarOption,
                                            datos.id_lugar === item.id_lugar.toString() && styles.lugarOptionSelected
                                        ]}
                                        onPress={() => seleccionarLugar(item)}
                                    >
                                        <View style={styles.lugarOptionContent}>
                                            <Text style={styles.lugarId}>ID: {item.id_lugar}</Text>
                                            <Text style={styles.lugarNombre}>
                                                {item.nombre || 'Sin nombre'}
                                            </Text>
                                            {item.descripcion && (
                                                <Text style={styles.lugarDescripcion}>
                                                    {item.descripcion}
                                                </Text>
                                            )}
                                        </View>
                                        {datos.id_lugar === item.id_lugar.toString() && (
                                            <Text style={styles.selectedIcon}>✅</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={false}
                            />
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalLugarVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}
// Estilos para los componentes de la pantalla de reporte.
const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: '#F9E5D5',
        flexGrow: 1,
        minHeight: '100%',
    },

    title: {
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 32,
        color: '#2C3E50',
        letterSpacing: 0.5,
        lineHeight: 34,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 20,
        textAlign: 'center',
        letterSpacing: 0.3,
    },

    listaTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 16,
        letterSpacing: 0.2,
    },

    input: {
        borderWidth: 2,
        borderColor: '#E8F4FD',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        fontSize: 16,
        color: '#2C3E50',
        fontWeight: '500',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
    },

    textArea: {
        borderWidth: 2,
        borderColor: '#E8F4FD',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        fontSize: 16,
        color: '#2C3E50',
        fontWeight: '500',
        minHeight: 100,
        textAlignVertical: 'top',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
    },

    searchInput: {
        borderWidth: 2,
        borderColor: '#E8F4FD',
        backgroundColor: '#F8FBFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        fontSize: 16,
        color: '#2C3E50',
        fontWeight: '500',
    },

    cantidadInput: {
        borderWidth: 2,
        borderColor: '#E8F4FD',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        fontSize: 16,
        color: '#2C3E50',
        fontWeight: '500',
        textAlign: 'center',
    },

    placeholder: {
        color: '#7F8C8D',
        fontStyle: 'italic',
    },

    fechaInputError: {
        borderColor: '#E74C3C',
        backgroundColor: '#FEF2F2',
        borderWidth: 2,
    },

    fechaInputValid: {
        borderColor: '#27AE60',
        backgroundColor: '#E8F8F5',
        borderWidth: 2,
    },

    fechaFeedbackContainer: {
        marginTop: -12,
        marginBottom: 20,
    },

    fechaValidaContainer: {
        backgroundColor: '#E8F8F5',
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#27AE60',
        flexDirection: 'row',
        alignItems: 'center',
    },

    fechaValidaTexto: {
        color: '#155724',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        flex: 1,
    },

    fechaErrorContainer: {
        backgroundColor: '#F8D7DA',
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#E74C3C',
        flexDirection: 'row',
        alignItems: 'center',
    },

    fechaErrorTexto: {
        color: '#721C24',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        flex: 1,
    },

    lugarSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        marginVertical: 16,
        borderWidth: 2,
        borderColor: '#E8F4FD',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
    },

    lugarTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 20,
        textAlign: 'center',
        letterSpacing: 0.2,
    },

    lugarSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E8F4FD',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },

    lugarSelectorError: {
        borderColor: '#E74C3C',
        backgroundColor: '#FEF2F2',
    },

    lugarSelectorText: {
        fontSize: 16,
        color: '#2C3E50',
        flex: 1,
        fontWeight: '500',
    },

    recargarButton: {
        backgroundColor: '#0066CC',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },

    recargarButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.5,
    },

    verLugaresButton: {
        backgroundColor: '#9B59B6',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#9B59B6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },

    verLugaresButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.5,
    },

    noLugaresContainer: {
        alignItems: 'center',
        padding: 32,
    },

    noLugaresText: {
        fontSize: 16,
        color: '#7F8C8D',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },

    lugaresList: {
        maxHeight: 320,
        marginBottom: 24,
    },

    lugarOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        marginBottom: 8,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E8F4FD',
        backgroundColor: '#FFFFFF',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },

    lugarOptionSelected: {
        backgroundColor: '#E8F8F5',
        borderColor: '#27AE60',
        borderLeftWidth: 6,
        borderLeftColor: '#27AE60',
        shadowColor: '#27AE60',
        shadowOpacity: 0.15,
    },

    lugarOptionContent: {
        flex: 1,
    },

    lugarId: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0066CC',
        letterSpacing: 0.3,
    },

    lugarNombre: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2C3E50',
        marginTop: 4,
        letterSpacing: 0.2,
    },

    lugarDescripcion: {
        fontSize: 14,
        color: '#7F8C8D',
        marginTop: 4,
        lineHeight: 20,
    },

    selectedIcon: {
        fontSize: 24,
        marginLeft: 16,
        color: '#27AE60',
    },

    materialesSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        marginVertical: 20,
        borderWidth: 2,
        borderColor: '#E8F4FD',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
    },

    materialSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E8F4FD',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },

    materialSelectorText: {
        fontSize: 16,
        color: '#2C3E50',
        flex: 1,
        fontWeight: '500',
    },

    materialSeleccionadoContainer: {
        backgroundColor: '#E8F8F5',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 6,
        borderLeftColor: '#27AE60',
        shadowColor: '#27AE60',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },

    materialSeleccionadoLabel: {
        fontSize: 12,
        color: '#7F8C8D',
        fontWeight: '700',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    materialSeleccionadoTexto: {
        fontSize: 18,
        color: '#2C3E50',
        fontWeight: '700',
        letterSpacing: 0.2,
    },

    dropdownIcon: {
        fontSize: 16,
        color: '#0066CC',
        fontWeight: 'bold',
    },

    addButton: {
        backgroundColor: '#0066CC',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 8,
    },

    saveButton: {
        backgroundColor: '#27AE60',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#27AE60',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },

    clearButton: {
        backgroundColor: '#E67E22',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#E67E22',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },

    generateButton: {
        backgroundColor: '#0066CC',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },

    shareButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },

    cancelButton: {
        backgroundColor: '#E74C3C',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#E74C3C',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },

    buttonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.5,
    },

    cancelButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.5,
    },

    materialesLista: {
        marginTop: 24,
    },

    materialItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8FBFF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#E8F4FD',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },

    materialInfo: {
        flex: 1,
    },

    materialNombre: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2C3E50',
        letterSpacing: 0.2,
    },

    materialCantidad: {
        fontSize: 14,
        color: '#7F8C8D',
        marginTop: 4,
        fontWeight: '500',
    },

    materialId: {
        fontSize: 12,
        color: '#95A5A6',
        marginTop: 4,
        fontStyle: 'italic',
    },

    deleteButton: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#FEE2E2',
        marginLeft: 16,
    },

    deleteButtonText: {
        fontSize: 20,
        color: '#E74C3C',
        fontWeight: 'bold',
    },

    materialsList: {
        maxHeight: 320,
        marginBottom: 24,
    },

    materialOption: {
        padding: 20,
        marginBottom: 8,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E8F4FD',
        backgroundColor: '#FFFFFF',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },

    materialClave: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0066CC',
        letterSpacing: 0.3,
    },

    materialDescripcion: {
        fontSize: 16,
        color: '#2C3E50',
        marginTop: 4,
        fontWeight: '500',
        letterSpacing: 0.1,
    },

    materialExistencia: {
        fontSize: 14,
        color: '#7F8C8D',
        marginTop: 6,
        fontWeight: '500',
    },

    actionButtonsContainer: {
        marginTop: 32,
        marginBottom: 40,
    },

    separator: {
        height: 2,
        backgroundColor: '#E8F4FD',
        marginVertical: 24,
        borderRadius: 1,
    },

    separatorText: {
        textAlign: 'center',
        color: '#7F8C8D',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 24,
        letterSpacing: 0.3,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(44, 62, 80, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        width: '100%',
        maxWidth: 400,
        maxHeight: '85%',
        borderWidth: 3,
        borderColor: '#E8F4FD',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 40,
        elevation: 20,
    },

    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 28,
        color: '#2C3E50',
        letterSpacing: 0.3,
    },

    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },

    inputFocused: {
        borderColor: '#0066CC',
        backgroundColor: '#F8FBFF',
        shadowColor: '#0066CC',
        shadowOpacity: 0.2,
    },

    buttonPressed: {
        transform: [{ scale: 0.98 }],
        shadowOpacity: 0.15,
    },

    materialOptionPressed: {
        backgroundColor: '#F8FBFF',
        borderColor: '#0066CC',
    },
});